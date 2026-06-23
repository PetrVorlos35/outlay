import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// The currently signed-in user, or null when unauthenticated.
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});
