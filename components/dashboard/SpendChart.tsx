"use client";

import { useLocale } from "next-intl";
import type { SpendPoint } from "@/lib/mock";
import { formatCurrency, formatCurrencyShort, formatMonth } from "@/lib/format";

/**
 * Bar chart in the established sparkline language: hairline bars, the current
 * month picked out in emerald. Hand-built (no chart lib) to stay on-brand and
 * keep the bundle lean.
 */
export default function SpendChart({
  data,
  height = 64,
  showLabels = false,
  showAxis = false,
}: {
  data: SpendPoint[];
  height?: number;
  showLabels?: boolean;
  showAxis?: boolean;
}) {
  const locale = useLocale();
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex gap-3">
      {showAxis && (
        <div
          className="flex w-12 shrink-0 flex-col justify-between py-0.5 text-right font-mono text-[10px] text-navy/40"
          style={{ height }}
          aria-hidden
        >
          <span>{formatCurrencyShort(max, locale)}</span>
          <span>{formatCurrencyShort(max / 2, locale)}</span>
          <span>{formatCurrencyShort(0, locale)}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-1.5" style={{ height }}>
          {data.map((d, i) => {
            const last = i === data.length - 1;
            const h = Math.max((d.amount / max) * 100, 2);
            return (
              <div
                key={d.month}
                className="group relative flex h-full flex-1 items-end"
                title={`${formatMonth(d.month, locale)} · ${formatCurrency(d.amount, locale)}`}
              >
                <div
                  className={`animate-bar-grow w-full rounded-sm transition-colors ${
                    last
                      ? "bg-emerald"
                      : "bg-navy/[0.12] group-hover:bg-navy/20"
                  }`}
                  style={{ height: `${h}%`, animationDelay: `${i * 45}ms` }}
                />
              </div>
            );
          })}
        </div>
        {showLabels && (
          <div className="mt-2 flex gap-1.5">
            {data.map((d, i) => (
              <span
                key={d.month}
                className={`flex-1 text-center text-[10px] font-medium ${
                  i === data.length - 1 ? "text-navy/70" : "text-navy/40"
                }`}
              >
                {formatMonth(d.month, locale)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
