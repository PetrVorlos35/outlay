"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import type { Subscription } from "@/lib/subscriptions";
import { useDashboard } from "./DashboardProvider";

/**
 * Quick actions shown on a subscription whose charge is due (today or overdue):
 * confirm payment — which rolls the renewal date forward a cycle — or cancel,
 * which pauses it. Both are undoable from the toast the provider raises. Buttons
 * stop propagation so they don't trigger the row's edit handler, and disable
 * while in flight so a double-tap can't fire twice.
 */
export default function DueActions({
  sub,
  className = "",
}: {
  sub: Subscription;
  className?: string;
}) {
  const t = useTranslations("dashboard.due");
  const { markPaid, pauseSubscription } = useDashboard();
  const [pending, setPending] = useState(false);

  function run(action: (sub: Subscription) => Promise<void>) {
    if (pending) return;
    setPending(true);
    action(sub).finally(() => setPending(false));
  }

  return (
    <div className={`flex shrink-0 items-center gap-1.5 ${className}`}>
      <button
        type="button"
        disabled={pending}
        aria-label={t("paidAria", { name: sub.name })}
        onClick={(e) => {
          e.stopPropagation();
          run(markPaid);
        }}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-ink px-3.5 text-xs font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-default disabled:opacity-60"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t("paid")}
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label={t("cancelAria", { name: sub.name })}
        onClick={(e) => {
          e.stopPropagation();
          run(pauseSubscription);
        }}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-navy/15 bg-white px-3.5 text-xs font-medium text-navy/70 transition-colors hover:border-navy/30 hover:text-navy focus:outline-none focus:ring-2 focus:ring-navy/25 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-default disabled:opacity-60"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t("cancel")}
      </button>
    </div>
  );
}
