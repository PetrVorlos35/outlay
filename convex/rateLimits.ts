import { RateLimiter, MINUTE, HOUR, SECOND } from "@convex-dev/rate-limiter";
import { getAuthUserId } from "@convex-dev/auth/server";
import { components } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Central rate-limit definitions. All limits are transactional and live in the
// `@convex-dev/rate-limiter` component (registered in convex.config.ts).
//
// `token bucket`  → smooth limit: refills `rate` tokens per `period`, bursts up
//                   to `capacity`. Good for "one action every N seconds".
// `fixed window`  → resets every `period`. Good for coarse global/abuse caps.
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // ── OTP emails (sign-up verification + password reset) ───────────────────
  // Keyed by email. One email roughly every 30s, with a little burst headroom
  // so an immediate legitimate resend isn't punished. This is the server-side
  // backstop for the client "Resend in 0:30" countdown.
  sendOtp: { kind: "token bucket", rate: 1, period: 30 * SECOND, capacity: 2 },

  // ── Waitlist signups ─────────────────────────────────────────────────────
  // Per-email throttle plus a global ceiling against scripted floods.
  waitlistJoin: { kind: "token bucket", rate: 3, period: HOUR, capacity: 3 },
  waitlistGlobal: { kind: "fixed window", rate: 200, period: HOUR },

  // ── Authenticated writes ─────────────────────────────────────────────────
  // Per-user budget shared across all subscription / preference mutations.
  // Generous enough that normal use never trips it; caps runaway clients.
  userWrite: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 30 },
});

/**
 * Require an authenticated user and consume one token from their shared write
 * budget. Drop-in replacement for the `getAuthUserId` + "Not authenticated"
 * guard at the top of write mutations. Throws if the user is writing too fast.
 */
export async function requireUserWithinWriteLimit(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  await rateLimiter.limit(ctx, "userWrite", { key: userId, throws: true });
  return userId;
}
