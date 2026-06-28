"use client";

import { useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { currencyForLocale, type CurrencyCode } from "@/lib/currency";

/**
 * The account's display currency. Sourced from the saved preference and, until
 * the user has chosen one, falls back to the locale default — so currency is
 * independent of the UI language but still sensible on first run.
 */
export function useAccountCurrency(): CurrencyCode {
  const locale = useLocale();
  const prefs = useQuery(api.preferences.get);
  return (prefs?.currency as CurrencyCode | undefined) ?? currencyForLocale(locale);
}
