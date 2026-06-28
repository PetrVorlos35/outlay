import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const billingCycle = v.union(
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("yearly"),
);

export const subStatus = v.union(v.literal("active"), v.literal("paused"));

export const currencyCode = v.union(
  v.literal("USD"),
  v.literal("EUR"),
  v.literal("CZK"),
  v.literal("GBP"),
);

export const category = v.union(
  v.literal("streaming"),
  v.literal("music"),
  v.literal("software"),
  v.literal("gaming"),
  v.literal("fitness"),
  v.literal("news"),
  v.literal("cloud"),
  v.literal("finance"),
  v.literal("other"),
);

export default defineSchema({
  // Convex Auth tables: users, authAccounts, authSessions, etc.
  ...authTables,

  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Reference catalog of known services, seeded from `lib/catalog.ts` and
  // editable from the DB without shipping code. Prices are USD baselines the
  // client converts to the user's currency on prefill.
  catalogEntries: defineTable({
    name: v.string(),
    domain: v.string(),
    color: v.string(),
    price: v.number(), // USD baseline
    priceCzk: v.optional(v.number()), // resolved local CZK price (real or converted)
    cycle: billingCycle,
    category: category,
    popular: v.optional(v.boolean()),
  }).index("by_name", ["name"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    price: v.number(),
    currency: v.string(),
    cycle: billingCycle,
    nextRenewal: v.string(), // ISO date (yyyy-mm-dd)
    category: category,
    status: subStatus,
    color: v.string(),
    logo: v.optional(v.string()),
    previousPrice: v.optional(v.number()),
    createdAt: v.number(),
    // The nextRenewal value we last emailed a reminder about (dedup guard).
    lastReminderSent: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    // Range-scan upcoming renewals across users for the reminder cron.
    .index("by_status_and_nextRenewal", ["status", "nextRenewal"]),

  notificationPrefs: defineTable({
    userId: v.id("users"),
    reminderLeadDays: v.number(), // how many days before a renewal to email (1/3/7)
    priceHikeAlerts: v.boolean(),
    weeklySummary: v.boolean(),
    // Account display currency. Independent of UI language; unset falls back to
    // the locale default on the client.
    currency: v.optional(currencyCode),
  }).index("by_user", ["userId"]),

  // One real spend snapshot per user per month — the monthly-normalized total of
  // their active subscriptions. The current month is kept fresh from the client;
  // a monthly cron seeds each new month. Replaces the old synthesized trend.
  spendHistory: defineTable({
    userId: v.id("users"),
    month: v.string(), // first of month, ISO "yyyy-mm-01"
    amount: v.number(),
  }).index("by_user_and_month", ["userId", "month"]),
});
