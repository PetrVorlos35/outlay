import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type NotificationPrefs = {
  reminderLeadDays: number;
  priceHikeAlerts: boolean;
  weeklySummary: boolean;
};

export const DEFAULT_PREFS: NotificationPrefs = {
  reminderLeadDays: 3,
  priceHikeAlerts: true,
  weeklySummary: false,
};

// Allowed lead-time options, matching the Settings select.
const leadDays = v.union(v.literal(1), v.literal(3), v.literal(7));

/** A user's prefs, or defaults when they've never saved any. Reused by the crons. */
export async function getPrefsForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<NotificationPrefs> {
  const row = await ctx.db
    .query("notificationPrefs")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return row
    ? {
        reminderLeadDays: row.reminderLeadDays,
        priceHikeAlerts: row.priceHikeAlerts,
        weeklySummary: row.weeklySummary,
      }
    : DEFAULT_PREFS;
}

export const get = query({
  args: {},
  handler: async (ctx): Promise<NotificationPrefs> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return DEFAULT_PREFS;
    return await getPrefsForUser(ctx, userId);
  },
});

export const set = mutation({
  args: {
    reminderLeadDays: v.optional(leadDays),
    priceHikeAlerts: v.optional(v.boolean()),
    weeklySummary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("notificationPrefs", {
        userId,
        ...DEFAULT_PREFS,
        ...args,
      });
    }
    return null;
  },
});
