// Spend-trend helper. There is no stored spend history yet, so the trend chart
// synthesizes a believable 7-month shape from the user's current monthly total.
// (Real historical spend can replace this once it's tracked in Convex.)

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
