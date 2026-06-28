// Locale-aware formatting. When `currency` is omitted it follows the locale
// (e.g. cs → CZK) via `currencyForLocale`; pass an explicit code to format a
// specific subscription in its own stored currency.

import { currencyForLocale } from "./currency";

export function formatCurrency(
  amount: number,
  locale: string,
  currency: string = currencyForLocale(locale),
  opts: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...opts,
  }).format(amount);
}

/** Whole-unit currency, for axis labels and dense figures. */
export function formatCurrencyShort(
  amount: number,
  locale: string,
  currency: string = currencyForLocale(locale),
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
