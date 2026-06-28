// Domain model for the dashboard. Shaped to mirror a future Convex
// `subscriptions` table so swapping mock data for live queries is mechanical:
// every field here maps 1:1 to a column, and `id` stands in for `_id`.

import { convert } from "./currency";

export type BillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";
export type SubStatus = "active" | "paused";
export type Category =
  | "streaming"
  | "music"
  | "software"
  | "gaming"
  | "fitness"
  | "news"
  | "cloud"
  | "finance"
  | "other";

export type Subscription = {
  id: string;
  name: string;
  /** Price charged each billing cycle, in `currency`. */
  price: number;
  currency: string;
  cycle: BillingCycle;
  /** ISO date (yyyy-mm-dd) of the next charge. */
  nextRenewal: string;
  category: Category;
  status: SubStatus;
  /** Brand tint for the monogram fallback tile. */
  color: string;
  /** Logo image URL (from the catalog); falls back to the monogram if absent or it fails to load. */
  logo?: string;
  /** Set when Outlay has detected a price increase; the prior price. */
  previousPrice?: number;
};

/** Fields the user actually edits in the drawer. */
export type SubscriptionDraft = Omit<Subscription, "id" | "currency"> & {
  currency?: string;
};

export const BILLING_CYCLES: BillingCycle[] = [
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
];

export const CATEGORIES: Category[] = [
  "streaming",
  "music",
  "software",
  "gaming",
  "fitness",
  "news",
  "cloud",
  "finance",
  "other",
];

// ── Money math ──────────────────────────────────────────────────────────────

const CYCLE_TO_MONTHLY: Record<BillingCycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
};

/** Normalize any cycle's price to a comparable monthly figure. */
export function monthlyAmount(price: number, cycle: BillingCycle): number {
  return price * CYCLE_TO_MONTHLY[cycle];
}

export function yearlyAmount(price: number, cycle: BillingCycle): number {
  return monthlyAmount(price, cycle) * 12;
}

/** Sum of monthly-normalized spend across the active subscriptions. */
export function totalMonthly(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + monthlyAmount(s.price, s.cycle), 0);
}

/** A subscription's monthly-normalized cost converted into `target` currency. */
export function monthlyAmountIn(sub: Subscription, target: string): number {
  return convert(monthlyAmount(sub.price, sub.cycle), sub.currency, target);
}

/**
 * Sum of monthly spend across active subscriptions, each converted into
 * `target` — so totals are correct even when subscriptions mix currencies.
 */
export function totalMonthlyIn(subs: Subscription[], target: string): number {
  return subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + monthlyAmountIn(s, target), 0);
}

export function hasPriceHike(sub: Subscription): boolean {
  return sub.previousPrice !== undefined && sub.previousPrice < sub.price;
}

// ── Dates ─────────────────────────────────────────────────────────────────

/** Whole days from the start of today to the start of `iso`. Past → negative. */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** A renewal counts as urgent inside this many days. */
export const URGENT_DAYS = 3;

export function isUrgent(sub: Subscription): boolean {
  if (sub.status !== "active") return false;
  const d = daysUntil(sub.nextRenewal);
  return d >= 0 && d <= URGENT_DAYS;
}

/** Due to be charged: active and the renewal date is today or already past. */
export function isDue(sub: Subscription): boolean {
  return sub.status === "active" && daysUntil(sub.nextRenewal) <= 0;
}

/** First day of the current month as ISO "yyyy-mm-01" (UTC) — matches snapshots. */
export function currentMonthIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
