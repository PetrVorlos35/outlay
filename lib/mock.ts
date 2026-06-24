// Shape of a single point on the spend-trend chart. The data itself is now real
// per-month history from Convex (`api.spend.trend`); see `convex/spend.ts`.

export type SpendPoint = { month: string; amount: number };
