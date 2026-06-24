import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// Monthly-normalized price, mirroring lib/subscriptions CYCLE_TO_MONTHLY.
function toMonthly(price: number, cycle: string): number {
  switch (cycle) {
    case "weekly":
      return (price * 52) / 12;
    case "quarterly":
      return price / 3;
    case "yearly":
      return price / 12;
    default:
      return price; // monthly
  }
}

/** First day of the current month as ISO "yyyy-mm-01". */
function currentMonthIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Insert or update the (user, month) snapshot. Idempotent on amount.
async function upsertSnapshot(
  ctx: MutationCtx,
  userId: Id<"users">,
  month: string,
  amount: number,
): Promise<void> {
  const existing = await ctx.db
    .query("spendHistory")
    .withIndex("by_user_and_month", (q) =>
      q.eq("userId", userId).eq("month", month),
    )
    .unique();
  if (existing) {
    if (existing.amount !== amount) await ctx.db.patch(existing._id, { amount });
  } else {
    await ctx.db.insert("spendHistory", { userId, month, amount });
  }
}

async function userMonthly(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const subs = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(1000);
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0);
}

/**
 * Record the signed-in user's current-month spend. Called from the dashboard as
 * subscriptions load/change, so this month's bar stays accurate; past months
 * freeze once a new month begins (we only ever touch the current month here).
 */
export const recordCurrentMonth = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const monthly = round2(await userMonthly(ctx, userId));
    await upsertSnapshot(ctx, userId, currentMonthIso(), monthly);
    return null;
  },
});

/** The signed-in user's real monthly spend history, oldest→newest, capped. */
export const trend = query({
  args: { months: v.optional(v.number()) },
  handler: async (ctx, { months }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("spendHistory")
      .withIndex("by_user_and_month", (q) => q.eq("userId", userId))
      .collect();
    rows.sort((a, b) => a.month.localeCompare(b.month));
    return rows
      .slice(-(months ?? 7))
      .map((r) => ({ month: r.month, amount: r.amount }));
  },
});

/**
 * Monthly cron: seed every user's snapshot for the current month from their
 * active subscriptions, so history keeps accruing even for users who don't open
 * the app. Idempotent with the client-side `recordCurrentMonth`.
 */
export const snapshotAllUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("subscriptions").take(50000);
    const byUser = new Map<Id<"users">, number>();
    for (const s of subs) {
      if (s.status !== "active") continue;
      byUser.set(s.userId, (byUser.get(s.userId) ?? 0) + toMonthly(s.price, s.cycle));
    }
    const month = currentMonthIso();
    for (const [userId, monthly] of byUser) {
      await upsertSnapshot(ctx, userId, month, round2(monthly));
    }
    return { users: byUser.size };
  },
});
