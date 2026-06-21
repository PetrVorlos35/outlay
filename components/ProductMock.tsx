"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight } from "lucide-react";

const TOTAL = 312.94;

// Last 7 months of spend (relative heights), current month last + highlighted.
const BARS = [62, 70, 58, 81, 74, 88, 95];

type Renewal = {
  name: string;
  monogram: string;
  tint: string;
  price: string;
  days: number;
};

const RENEWALS: Renewal[] = [
  { name: "Netflix", monogram: "N", tint: "bg-[#E50914]", price: "15.49", days: 2 },
  { name: "Spotify", monogram: "S", tint: "bg-[#1DB954]", price: "10.99", days: 9 },
  { name: "Adobe CC", monogram: "A", tint: "bg-[#EB1000]", price: "54.99", days: 14 },
  { name: "Figma", monogram: "F", tint: "bg-[#F24E1E]", price: "15.00", days: 21 },
];

export default function ProductMock() {
  const t = useTranslations("mock");
  const locale = useLocale();

  const formatDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    }).format(d);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white shadow-[0_1px_2px_rgba(11,18,32,0.04),0_24px_48px_-24px_rgba(11,18,32,0.18)]">
      {/* App header */}
      <div className="flex items-center justify-between border-b border-navy/[0.07] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-dot" aria-hidden />
          <span className="text-xs font-medium text-navy/60">{t("live")}</span>
        </div>
        <div className="flex items-center rounded-lg border border-navy/10 p-0.5 text-[11px] font-medium">
          <span className="rounded-md bg-navy px-2 py-0.5 text-paper">{t("month")}</span>
          <span className="px-2 py-0.5 text-navy/60">{t("year")}</span>
        </div>
      </div>

      {/* Total */}
      <div className="px-5 pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
          {t("monthlySpend")}
        </p>
        <div className="mt-1 flex items-end justify-between">
          <p className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-navy">
            ${TOTAL.toFixed(2)}
          </p>
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald-ink">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span className="font-mono">$18.40</span>
          </span>
        </div>

        {/* Sparkline bars */}
        <div className="mt-4 flex h-16 items-end gap-1.5" aria-hidden>
          {BARS.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                i === BARS.length - 1 ? "bg-emerald" : "bg-navy/10"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Upcoming renewals */}
      <div className="mt-4 border-t border-navy/[0.07] px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
            {t("upcoming")}
          </p>
          <span className="font-mono text-[11px] text-navy/60">
            {t("active", { count: 14 })}
          </span>
        </div>

        <ul className="mt-2 -mb-1">
          {RENEWALS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 py-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white ${r.tint}`}
                aria-hidden
              >
                {r.monogram}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">{r.name}</p>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    r.days <= 3 ? "text-amber-ink" : "text-navy/60"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      r.days <= 3 ? "bg-amber" : "bg-navy/30"
                    }`}
                    aria-hidden
                  />
                  {t("renewsIn", { days: r.days, date: formatDate(r.days) })}
                </span>
              </div>
              <p className="font-mono text-sm font-medium tabular-nums text-navy">
                ${r.price}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
