"use client";

import { useLocale, useTranslations } from "next-intl";
import { daysUntil, URGENT_DAYS } from "@/lib/subscriptions";
import { formatDate } from "@/lib/format";

/**
 * Countdown to a renewal with consistent urgency styling: amber inside
 * URGENT_DAYS, muted otherwise. Used in lists, the overview, and the table.
 */
export default function RenewalBadge({
  iso,
  withDate = false,
}: {
  iso: string;
  withDate?: boolean;
}) {
  const t = useTranslations("dashboard.renews");
  const locale = useLocale();
  const days = daysUntil(iso);
  const urgent = days >= 0 && days <= URGENT_DAYS;

  let label: string;
  if (days < 0) label = t("overdue");
  else if (days === 0) label = t("today");
  else if (days === 1) label = t("tomorrow");
  else label = t("inDays", { days });

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        urgent || days < 0 ? "text-amber-ink" : "text-navy/55"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          urgent || days < 0 ? "bg-amber" : "bg-navy/25"
        }`}
        aria-hidden
      />
      {label}
      {withDate && days >= 0 && (
        <span className="text-navy/40">· {formatDate(iso, locale)}</span>
      )}
    </span>
  );
}
