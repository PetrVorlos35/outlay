// Locale-aware formatting. Currency is USD for now but routed through one
// helper so it's a single swap when per-account currency lands.

export function formatCurrency(
  amount: number,
  locale: string,
  currency = "USD",
  opts: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...opts,
  }).format(amount);
}

/** Whole-dollar currency, for axis labels and dense figures. */
export function formatCurrencyShort(
  amount: number,
  locale: string,
  currency = "USD",
): string {
  return formatCurrency(amount, locale, currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(iso + "T00:00:00"));
}

export function formatMonth(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(
    new Date(iso + "T00:00:00"),
  );
}

/** First letter for a monogram tile. */
export function monogram(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
