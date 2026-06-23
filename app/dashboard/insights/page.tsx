"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TrendingUp, Sparkles } from "lucide-react";
import {
  hasPriceHike,
  monthlyAmount,
  totalMonthly,
  type Category,
} from "@/lib/subscriptions";
import { buildSpendHistory } from "@/lib/mock";
import { formatCurrency } from "@/lib/format";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import {
  EmptyState,
  PageHeader,
  Panel,
} from "@/components/dashboard/primitives";
import SubLogo from "@/components/dashboard/SubLogo";
import SpendChart from "@/components/dashboard/SpendChart";
import AddSubscriptionButton from "@/components/dashboard/AddSubscriptionButton";
import { InsightsSkeleton } from "@/components/dashboard/Skeletons";
import PageTitle from "@/components/dashboard/PageTitle";

export default function InsightsPage() {
  const t = useTranslations("dashboard.insights");
  const td = useTranslations("dashboard");
  const tcat = useTranslations("dashboard.category");
  const locale = useLocale();
  const { subscriptions, loading, openEdit } = useDashboard();

  const data = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const monthly = totalMonthly(subscriptions);
    const history = buildSpendHistory(monthly);

    const ranked = [...active]
      .map((s) => ({ sub: s, monthly: monthlyAmount(s.price, s.cycle) }))
      .sort((a, b) => b.monthly - a.monthly);

    const byCategory = new Map<Category, number>();
    for (const s of active) {
      byCategory.set(
        s.category,
        (byCategory.get(s.category) ?? 0) + monthlyAmount(s.price, s.cycle),
      );
    }
    const categories = [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const hikes = subscriptions.filter(hasPriceHike);

    return {
      active,
      monthly,
      history,
      ranked,
      categories,
      hikes,
      avg: active.length > 0 ? monthly / active.length : 0,
    };
  }, [subscriptions]);

  const percent = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(data.monthly > 0 ? n / data.monthly : 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <PageTitle section={td("nav.insights")} />
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <InsightsSkeleton />
      </div>
    );
  }

  if (data.active.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <PageTitle section={td("nav.insights")} />
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <Panel bodyClassName="">
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title={td("empty.title")}
            body={t("empty")}
            action={<AddSubscriptionButton label={td("empty.cta")} />}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageTitle section={td("nav.insights")} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 lg:grid-cols-4">
        <StatTile
          label={t("statMonthly")}
          value={formatCurrency(data.monthly, locale)}
        />
        <StatTile
          label={t("statAnnual")}
          value={formatCurrency(data.monthly * 12, locale)}
        />
        <StatTile
          label={t("statActive")}
          value={String(data.active.length)}
        />
        <StatTile
          label={t("statAvg")}
          value={formatCurrency(data.avg, locale)}
        />
      </div>

      {/* Trend + category */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={t("trendTitle")} subtitle={t("trendSubtitle")}>
          <SpendChart data={data.history} height={180} showLabels showAxis />
        </Panel>

        <Panel title={t("categoryTitle")}>
          <ul className="space-y-4">
            {data.categories.map(({ category, amount }) => (
              <li key={category}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-navy">
                    {tcat(category)}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-navy/70">
                    {formatCurrency(amount, locale)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-navy/[0.06]">
                  <div
                    className="h-full rounded-full bg-emerald-ink"
                    style={{
                      width: `${data.monthly > 0 ? (amount / data.monthly) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Breakdown + hikes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={t("breakdownTitle")} subtitle={t("breakdownSubtitle")}>
          <ul className="space-y-4">
            {data.ranked.map(({ sub, monthly }) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => openEdit(sub)}
                  className="block w-full text-left"
                >
                  <div className="mb-1.5 flex items-center gap-3">
                    <SubLogo sub={sub} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                      {sub.name}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-navy">
                      {formatCurrency(monthly, locale)}
                    </span>
                    <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-navy/45">
                      {percent(monthly)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-navy/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.monthly > 0 ? (monthly / data.monthly) * 100 : 0}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("hikesTitle")} subtitle={t("hikesSubtitle")}>
          {data.hikes.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy/55">
              {t("hikesClear")}
            </p>
          ) : (
            <ul className="space-y-1">
              {data.hikes.map((sub) => (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(sub)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-navy/[0.03]"
                  >
                    <SubLogo sub={sub} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">
                        {sub.name}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-ink">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {td("hike.detail", {
                          amount: formatCurrency(
                            sub.price - (sub.previousPrice ?? sub.price),
                            locale,
                          ),
                          old: formatCurrency(sub.previousPrice ?? 0, locale),
                        })}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-medium tabular-nums text-navy">
                      {formatCurrency(sub.price, locale)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-4 sm:px-6 sm:py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-navy/55">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-xl font-semibold tabular-nums tracking-tight text-navy sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
