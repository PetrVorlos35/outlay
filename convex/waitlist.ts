import { internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";

// Capture a waitlist signup. Duplicate emails are treated as success
// (idempotent) so the UI never surfaces an error for re-submitting.
export const join = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return null;
    }

    await ctx.db.insert("waitlist", { email, createdAt: Date.now() });
    return null;
  },
});

/** Every waitlist address, oldest first. Internal — used by the broadcast action. */
export const allEmails = internalQuery({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const rows = await ctx.db.query("waitlist").take(10000);
    return rows.map((r) => r.email);
  },
});
