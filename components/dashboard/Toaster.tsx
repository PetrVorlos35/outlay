"use client";

import { useTranslations } from "next-intl";
import { Check, TriangleAlert, X } from "lucide-react";
import { useDashboard } from "./DashboardProvider";

export default function Toaster() {
  const t = useTranslations("dashboard.toast");
  const { toasts, dismissToast } = useDashboard();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const error = toast.tone === "error";
        return (
          <div
            key={toast.id}
            className="animate-toast-in pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-xl border border-navy/10 bg-navy py-2 pl-3 pr-2 text-sm font-medium text-paper shadow-[0_12px_32px_-12px_rgba(11,18,32,0.5)] motion-reduce:animate-none"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                error ? "bg-amber/20 text-amber" : "bg-emerald/20 text-emerald"
              }`}
            >
              {error ? (
                <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              )}
            </span>

            <span className="min-w-0 py-0.5">{toast.message}</span>

            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action!.run();
                  dismissToast(toast.id);
                }}
                className="ml-1 shrink-0 cursor-pointer rounded-md border-l border-paper/15 pl-3 pr-1 font-semibold text-emerald transition-colors hover:text-emerald/80"
              >
                {toast.action.label}
              </button>
            )}

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t("dismiss")}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-paper/45 transition-colors hover:bg-paper/10 hover:text-paper"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
