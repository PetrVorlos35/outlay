// Single account currency, derived from the UI locale. The catalog stores USD
// defaults; we convert those to the user's currency when prefilling the add
// form. Real per-account currency settings can later override `currencyForLocale`.

export type CurrencyCode = "USD" | "EUR" | "CZK" | "GBP";

/** UI locale → the currency we present money in. Defaults to USD. */
const CURRENCY_BY_LOCALE: Record<string, CurrencyCode> = {
  cs: "CZK",
  en: "USD",
};

export function currencyForLocale(locale: string): CurrencyCode {
  return CURRENCY_BY_LOCALE[locale] ?? "USD";
}

// Static USD→X rates. These seed editable prefill defaults and normalize mixed
// currencies in totals, so they don't need to be live — close enough is fine.
const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  CZK: 23,
  GBP: 0.79,
};

function rateOf(currency: string): number {
  return USD_RATES[currency as CurrencyCode] ?? 1;
}

/**
 * Convert an amount between currencies via USD as the pivot. Unknown codes fall
 * back to a 1:1 rate so a stray currency never zeroes out a total. Not rounded —
 * round at format time so summed conversions stay precise.
 */
export function convert(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  return (amount / rateOf(from)) * rateOf(to);
}

/**
 * Convert a USD catalog price into `currency`, rounded to a tidy value: whole
 * units for CZK (prices there are never sub-unit), two decimals elsewhere.
 */
export function convertFromUsd(amountUsd: number, currency: CurrencyCode): number {
  const raw = amountUsd * USD_RATES[currency];
  return currency === "CZK"
    ? Math.round(raw)
    : Math.round(raw * 100) / 100;
}

/** Symbol for the price input affix. */
export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  CZK: "Kč",
  GBP: "£",
};
