"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { logoUrl, catalogPrice, type CatalogEntry } from "@/lib/catalog";
import type { SubscriptionDraft } from "@/lib/subscriptions";
import { useDashboard } from "./DashboardProvider";
import { useAccountCurrency } from "./useAccountCurrency";
import { useCatalog } from "./useCatalog";
import SubLogo from "./SubLogo";
import AddSubscriptionButton from "./AddSubscriptionButton";

function todayPlus(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * First-run state for a brand-new account. Instead of a single CTA, it offers
 * one-tap quick-adds of popular services so a user reaches their first real
 * number (monthly spend) in a single click — the product's aha moment.
 */
export default function DashboardEmpty() {
  const t = useTranslations("dashboard.onboard");
  const td = useTranslations("dashboard");
  const { addSubscription } = useDashboard();
  const { popular } = useCatalog();
  const accountCurrency = useAccountCurrency();
  const [adding, setAdding] = useState(false);

  function quickAdd(entry: CatalogEntry) {
    if (adding) return;
    setAdding(true);
    const draft: SubscriptionDraft = {
      name: entry.name,
      price: catalogPrice(entry, accountCurrency),
      cycle: entry.cycle,
      category: entry.category,
      nextRenewal: todayPlus(30),
      status: "active",
      color: entry.color,
      logo: logoUrl(entry.domain),
      currency: accountCurrency,
    };
    // The view unmounts once the first sub lands; reset guards the error path.
    addSubscription(draft).finally(() => setAdding(false));
  }

  return (
    <div className="flex flex-col items-center px-6 py-14 text-center sm:py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald-ink">
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-navy text-balance">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-navy/60 text-pretty">
        {t("body")}
      </p>

      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-navy/45">
        {t("popular")}
      </p>
      <div className="mt-3 flex max-w-xl flex-wrap items-center justify-center gap-2">
        {popular.map((entry) => (
          <button
            key={entry.name}
            type="button"
            disabled={adding}
            onClick={() => quickAdd(entry)}
            className="inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-navy/15 bg-white py-1 pl-1.5 pr-3.5 text-sm font-medium text-navy transition-colors hover:border-navy/30 hover:bg-navy/[0.02] focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:cursor-default disabled:opacity-60"
          >
            <SubLogo
              sub={{ name: entry.name, color: entry.color, logo: logoUrl(entry.domain) }}
              size="sm"
            />
            {entry.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-navy/45">{t("quickAddHint")}</p>

      <div className="mt-7 flex items-center gap-3">
        <span className="text-sm text-navy/40">{t("or")}</span>
        <AddSubscriptionButton label={td("empty.cta")} variant="soft" />
      </div>
    </div>
  );
}
