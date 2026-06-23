import type { BillingCycle, Subscription, SubStatus } from "./subscriptions";
import { CATALOG, logoUrl } from "./catalog";

// ── Mock dataset ─────────────────────────────────────────────────────────────
// Stands in for `api.subscriptions.list`. Built from the catalog so every entry
// carries a correct domain (working logo), color, cycle, and category. Renewal
// dates are generated relative to today so countdowns stay realistic. The picks
// below add the per-user details: when it renews, status, and any price hike.

function isoInDays(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function catalogEntry(name: string) {
  const entry = CATALOG.find((c) => c.name === name);
  if (!entry) throw new Error(`mock: no catalog entry named "${name}"`);
  return entry;
}

type Pick = {
  name: string;
  /** Days from today until the next renewal. */
  days: number;
  status?: SubStatus;
  /** Override the catalog's default price (e.g. after a hike or a yearly plan). */
  price?: number;
  /** Override the catalog's default billing cycle. */
  cycle?: BillingCycle;
  /** Set to show a detected price increase. */
  previousPrice?: number;
};

const PICKS: Pick[] = [
  { name: "Netflix", days: 1, price: 17.99, previousPrice: 15.49 }, // urgent + hike
  { name: "Spotify", days: 3 }, // urgent
  { name: "ChatGPT Plus", days: 6 },
  { name: "iCloud+", days: 9 },
  { name: "Figma", days: 12 },
  { name: "Adobe Creative Cloud", days: 15, price: 62.99, previousPrice: 59.99 }, // hike
  { name: "YouTube Premium", days: 18 },
  { name: "The New York Times", days: 22 },
  { name: "Notion", days: 31 },
  { name: "Xbox Game Pass", days: 48, cycle: "yearly", price: 119.88 }, // yearly plan
  { name: "Dropbox", days: 73, cycle: "yearly", price: 119.88 }, // yearly plan
  { name: "Strava", days: 27, status: "paused" },
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = PICKS.map((pick, i) => {
  const entry = catalogEntry(pick.name);
  return {
    id: `sub_${entry.domain.split(".")[0]}_${i}`,
    name: entry.name,
    price: pick.price ?? entry.price,
    previousPrice: pick.previousPrice,
    currency: "USD",
    cycle: pick.cycle ?? entry.cycle,
    nextRenewal: isoInDays(pick.days),
    category: entry.category,
    status: pick.status ?? "active",
    color: entry.color,
    logo: logoUrl(entry.domain),
  };
});

// 7-month monthly-spend history for the trend chart. Last point is the current
// month; the series trends up to roughly today's normalized monthly total.
export type SpendPoint = { month: string; amount: number };

export function buildSpendHistory(currentMonthly: number): SpendPoint[] {
  // Relative shape leading into the present; scaled so the last bar ≈ today.
  const shape = [0.82, 0.88, 0.85, 0.93, 0.9, 0.97, 1];
  const now = new Date();
  return shape.map((factor, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (shape.length - 1 - i), 1);
    return {
      month: d.toISOString().slice(0, 10),
      amount: Math.round(currentMonthly * factor * 100) / 100,
    };
  });
}
