import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { billingCycle, category, subStatus } from "./schema";
import { getPrefsForUser } from "./preferences";
import { priceHikeEmail } from "./notifications";

type Cycle = "weekly" | "monthly" | "quarterly" | "yearly";

// Push an ISO date (yyyy-mm-dd) forward by one billing cycle.
function advanceRenewal(iso: string, cycle: Cycle): string {
  const d = new Date(iso + "T00:00:00");
  if (cycle === "weekly") d.setDate(d.getDate() + 7);
  else if (cycle === "monthly") d.setMonth(d.getMonth() + 1);
  else if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

// Shared input fields for add/update. Owner and bookkeeping fields are derived
// server-side, never accepted from the client.
const subscriptionInput = {
  name: v.string(),
  price: v.number(),
  currency: v.optional(v.string()),
  cycle: billingCycle,
  nextRenewal: v.string(),
  category: category,
  status: subStatus,
  color: v.string(),
  logo: v.optional(v.string()),
  previousPrice: v.optional(v.number()),
};

/** The signed-in user's subscriptions. Empty for signed-out or new users. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const docs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500);

    // Map to the client shape (`id` instead of `_id`); omit internal fields.
    return docs.map((d) => ({
      id: d._id,
      name: d.name,
      price: d.price,
      currency: d.currency,
      cycle: d.cycle,
      nextRenewal: d.nextRenewal,
      category: d.category,
      status: d.status,
      color: d.color,
      logo: d.logo,
      previousPrice: d.previousPrice,
    }));
  },
});

export const add = mutation({
  args: subscriptionInput,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    return await ctx.db.insert("subscriptions", {
      ...args,
      userId,
      currency: args.currency ?? "USD",
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("subscriptions"), ...subscriptionInput },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Subscription not found");
    }

    // Detect a price increase server-side: record the prior price (drives the
    // hike badge) and, if the user opted in, email an alert.
    const increased = fields.price > existing.price;
    const decreased = fields.price < existing.price;
    const previousPrice = increased
      ? existing.price
      : decreased
        ? undefined
        : existing.previousPrice;

    await ctx.db.patch(id, {
      ...fields,
      currency: fields.currency ?? existing.currency,
      previousPrice,
    });

    if (increased) {
      const prefs = await getPrefsForUser(ctx, userId);
      if (prefs.priceHikeAlerts) {
        const user = await ctx.db.get(userId);
        if (user?.email) {
          const { subject, text, html } = priceHikeEmail(
            fields.name,
            existing.price,
            fields.price,
            fields.currency ?? existing.currency,
          );
          await ctx.scheduler.runAfter(0, internal.email.send, {
            to: user.email,
            subject,
            text,
            html,
          });
        }
      }
    }
    return null;
  },
});

/**
 * The user paid this cycle's charge: advance the renewal date by one cycle so
 * the countdown restarts. If several cycles were missed, keep stepping until
 * the date is back in the future. Re-arms the renewal reminder.
 */
export const markPaid = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Subscription not found");
    }

    let next = advanceRenewal(existing.nextRenewal, existing.cycle);
    // Guard bounds the loop (≈20 years of weekly charges) against bad data.
    for (let i = 0; daysUntil(next) < 0 && i < 1040; i++) {
      next = advanceRenewal(next, existing.cycle);
    }

    await ctx.db.patch(id, {
      nextRenewal: next,
      status: "active",
      lastReminderSent: undefined,
    });
    return next;
  },
});

/** Flip a subscription between active and paused (e.g. after cancelling it). */
export const setStatus = mutation({
  args: { id: v.id("subscriptions"), status: subStatus },
  handler: async (ctx, { id, status }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Subscription not found");
    }

    await ctx.db.patch(id, { status });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db.get(id);
    // Idempotent: someone else's row or an already-deleted row is a no-op.
    if (!existing || existing.userId !== userId) return null;

    await ctx.db.delete(id);
    return null;
  },
});
