"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import {
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/dashboard/primitives";
import SubscriptionTable from "@/components/dashboard/SubscriptionTable";
import AddSubscriptionButton from "@/components/dashboard/AddSubscriptionButton";
import { TableSkeleton } from "@/components/dashboard/Skeletons";
import PageTitle from "@/components/dashboard/PageTitle";

export default function SubscriptionsPage() {
  const t = useTranslations("dashboard.table");
  const td = useTranslations("dashboard");
  const { subscriptions, loading } = useDashboard();

  const active = subscriptions.filter((s) => s.status === "active").length;
  const subtitle =
    subscriptions.length > 0
      ? `${t("count", { count: subscriptions.length })} · ${t("active", { count: active })}`
      : t("subtitle");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageTitle section={td("nav.subscriptions")} />
      <PageHeader
        title={t("title")}
        subtitle={loading ? t("subtitle") : subtitle}
        action={<AddSubscriptionButton />}
      />

      {loading ? (
        <TableSkeleton />
      ) : subscriptions.length === 0 ? (
        <Panel bodyClassName="">
          <EmptyState
            icon={<Plus className="h-6 w-6" />}
            title={td("empty.title")}
            body={td("empty.body")}
            action={<AddSubscriptionButton label={td("empty.cta")} />}
          />
        </Panel>
      ) : (
        <SubscriptionTable />
      )}
    </div>
  );
}
