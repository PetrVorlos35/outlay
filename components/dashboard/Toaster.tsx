"use client";

import { Check } from "lucide-react";
import { useDashboard } from "./DashboardProvider";

export default function Toaster() {
  const { toasts, dismissToast } = useDashboard();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="animate-toast-in pointer-events-auto flex items-center gap-2.5 rounded-xl border border-navy/10 bg-navy px-4 py-2.5 text-sm font-medium text-paper shadow-[0_12px_32px_-12px_rgba(11,18,32,0.5)] motion-reduce:animate-none"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald/20 text-emerald">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {toast.message}
        </button>
      ))}
    </div>
  );
}
