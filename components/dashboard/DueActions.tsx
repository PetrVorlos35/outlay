"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import type { Subscription } from "@/lib/subscriptions";
import { useDashboard } from "./DashboardProvider";

/**
 * Quick actions shown on a subscription whose charge is due (today or overdue):
 * confirm payment — which rolls the renewal date forward a cycle — or cancel,
 * which pauses it. Buttons stop propagation so they don't trigger the row's
 * edit handler.
 */
export default function DueActions({
  sub,
  className = "",
}: {
  sub: Subscription;
  className?: string;
}) {
  const t = useTranslations("dashboard.due");
  const tt = useTranslations("dashboard.toast");
  const { markPaid, pauseSubscription, notify } = useDashboard();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          markPaid(sub.id);
          notify(tt("paid", { name: sub.name }));
        }}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-ink px-3 text-xs font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t("paid")}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          pauseSubscription(sub.id);
          notify(tt("canceled", { name: sub.name }));
        }}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 text-xs font-medium text-navy/70 transition-colors hover:border-navy/30 hover:text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t("cancel")}
      </button>
    </div>
  );
}
