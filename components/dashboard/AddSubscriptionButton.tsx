"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDashboard } from "./DashboardProvider";

export default function AddSubscriptionButton({
  label,
  variant = "solid",
}: {
  label?: string;
  variant?: "solid" | "soft";
}) {
  const t = useTranslations("dashboard");
  const { openAdd } = useDashboard();
  const text = label ?? t("add");

  const cls =
    variant === "soft"
      ? "border border-emerald-ink/20 bg-emerald/10 text-emerald-ink hover:bg-emerald/15"
      : "bg-emerald-ink text-paper hover:bg-emerald-ink/90";

  return (
    <button
      type="button"
      onClick={openAdd}
      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper ${cls}`}
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      {text}
    </button>
  );
}
