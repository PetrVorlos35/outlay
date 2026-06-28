"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  currentMonthIso,
  daysUntil,
  hasPriceHike,
  isDue,
  isUrgent,
  totalMonthlyIn,
  type Subscription,
} from "@/lib/subscriptions";
import type { SpendPoint } from "@/lib/mock";
import { formatCurrency } from "@/lib/format";
import { convert } from "@/lib/currency";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAccountCurrency } from "@/components/dashboard/useAccountCurrency";
import { Panel, PageHeader, EmptyState } from "@/components/dashboard/primitives";
import SubLogo from "@/components/dashboard/SubLogo";
import RenewalBadge from "@/components/dashboard/RenewalBadge";
import DueActions from "@/components/dashboard/DueActions";
import DashboardEmpty from "@/components/dashboard/DashboardEmpty";
import InfoHint from "@/components/dashboard/InfoHint";
import SpendChart from "@/components/dashboard/SpendChart";
import { OverviewSkeleton } from "@/components/dashboard/Skeletons";
import PageTitle from "@/components/dashboard/PageTitle";

export default function OverviewPage() {
  const t = useTranslations("dashboard.overview");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const accountCurrency = useAccountCurrency();
  const { subscriptions, loading, openAdd, openEdit } = useDashboard();
  const viewer = useQuery(api.users.viewer);
  const trendData = useQuery(api.spend.trend, { months: 7 });
  const [view, setView] = useState<"month" | "year">("month");

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const monthly = totalMonthlyIn(subscriptions, accountCurrency);
    const upcoming = [...active]
      .filter((s) => daysUntil(s.nextRenewal) >= 0)
      .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal));
    const urgent = upcoming.filter(isUrgent);
    const hikes = subscriptions.filter(hasPriceHike);
    return {
      active,
      monthly,
      upcoming,
      urgent,
      hikes,
      next: upcoming[0],
    };
  }, [subscriptions, accountCurrency]);

  // Real recorded history (stored in USD) converted to the account currency;
  // before the first snapshot lands, show this month live so the chart isn't
  // empty. Change pill compares the two most recent months.
  const history = useMemo<SpendPoint[]>(() => {
    const real = (trendData ?? []).map((p) => ({
      month: p.month,
      amount: Math.round(convert(p.amount, "USD", accountCurrency) * 100) / 100,
    }));
    if (real.length > 0) return real;
    return stats.monthly > 0
      ? [{ month: currentMonthIso(), amount: Math.round(stats.monthly * 100) / 100 }]
      : [];
  }, [trendData, stats.monthly, accountCurrency]);
  const change =
    history.length > 1
      ? history[history.length - 1].amount - history[history.length - 2].amount
      : 0;

  const firstName = viewer?.name?.trim().split(" ")[0];
  const greeting = firstName
    ? t("greeting", { name: firstName })
    : t("greetingPlain");

  const factor = view === "year" ? 12 : 1;
  const headlineTotal = stats.monthly * factor;
  const headlineChange = change * factor;
  const chartData =
    view === "year"
      ? history.map((p) => ({ ...p, amount: p.amount * 12 }))
      : history;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <PageTitle section={td("nav.overview")} />
        <PageHeader title={greeting} subtitle={t("subtitle")} />
        <OverviewSkeleton />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <PageTitle section={td("nav.overview")} />
        <PageHeader title={greeting} subtitle={t("subtitle")} />
        <Panel bodyClassName="">
          <DashboardEmpty />
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <PageTitle section={td("nav.overview")} />
      <PageHeader
        title={greeting}
        subtitle={t("subtitle")}
        action={<AddCta label={td("add")} onClick={openAdd} />}
      />

      {/* Hero spend band */}
      <div className="grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-navy/55">
              {view === "year" ? t("annualSpend") : t("monthlySpend")}
            </p>
            <div className="inline-flex rounded-lg border border-navy/15 bg-white p-0.5 text-xs font-medium">
              {(["month", "year"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                    view === v
                      ? "bg-navy text-paper"
                      : "text-navy/60 hover:text-navy"
                  }`}
                >
                  {t(v)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="font-mono text-4xl font-semibold leading-none tabular-nums tracking-tight text-navy sm:text-[2.75rem]">
              {formatCurrency(headlineTotal, locale, accountCurrency)}
            </p>
            <ChangePill
              change={headlineChange}
              locale={locale}
              currency={accountCurrency}
              t={t}
            />
          </div>
          <p className="mt-2 text-sm text-navy/55">
            {view === "year"
              ? t("perMonth", {
                  amount: formatCurrency(stats.monthly, locale, accountCurrency),
                })
              : t("perYear", {
                  amount: formatCurrency(stats.monthly * 12, locale, accountCurrency),
                })}
          </p>

          <div className="mt-7">
            <SpendChart data={chartData} height={88} showLabels currency={accountCurrency} />
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy/40">
              {td("chart.estimate")}
              <InfoHint label={td("help.trendLabel")} text={td("help.trend")} />
            </p>
          </div>
        </div>

        {/* Side stats */}
        <div className="flex flex-col bg-white">
          <Stat
            label={t("activeLabel")}
            value={
              <span className="font-mono tabular-nums">{stats.active.length}</span>
            }
          />
          <Stat
            label={td("insights.statAnnual")}
            value={
              <span className="font-mono tabular-nums">
                {formatCurrency(stats.monthly * 12, locale, accountCurrency)}
              </span>
            }
          />
          <Stat
            label={t("nextLabel")}
            value={
              stats.next ? (
                <span className="flex items-center gap-2">
                  <SubLogo sub={stats.next} size="sm" />
                  <span className="truncate text-sm font-semibold text-navy">
                    {stats.next.name}
                  </span>
                </span>
              ) : (
                "—"
              )
            }
            footer={
              stats.next ? <RenewalBadge iso={stats.next.nextRenewal} withDate /> : undefined
            }
            last
          />
        </div>
      </div>

      {/* Lists */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel
          title={t("upcoming")}
          action={
            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-ink transition-colors hover:text-emerald-ink/80"
            >
              {t("viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName="px-2 py-2 sm:px-3"
        >
          {stats.upcoming.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-navy/55">
              {t("upcomingEmpty")}
            </p>
          ) : (
          <ul>
            {stats.upcoming.slice(0, 6).map((sub) => (
              <li key={sub.id}>
                <button
                  type="button"
                  onClick={() => openEdit(sub)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-navy/[0.03]"
                >
                  <SubLogo sub={sub} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">
                      {sub.name}
                    </p>
                    <RenewalBadge iso={sub.nextRenewal} withDate />
                  </div>
                  <span className="font-mono text-sm font-medium tabular-nums text-navy">
                    {formatCurrency(sub.price, locale, sub.currency)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          )}
        </Panel>

        <Panel title={t("attention")} bodyClassName="px-2 py-2 sm:px-3">
          {stats.urgent.length === 0 && stats.hikes.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title={t("attentionClear")}
              body={t("attentionClearBody")}
            />
          ) : (
            <ul>
              {stats.urgent.map((sub) => (
                <AttentionRow
                  key={`u-${sub.id}`}
                  sub={sub}
                  onClick={() => openEdit(sub)}
                  detail={<RenewalBadge iso={sub.nextRenewal} withDate />}
                  trailing={
                    <span className="font-mono text-sm font-medium tabular-nums text-navy">
                      {formatCurrency(sub.price, locale, sub.currency)}
                    </span>
                  }
                />
              ))}
              {stats.hikes.map((sub) => (
                <AttentionRow
                  key={`h-${sub.id}`}
                  sub={sub}
                  onClick={() => openEdit(sub)}
                  detail={
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-ink">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {td("hike.detail", {
                        amount: formatCurrency(
                          sub.price - (sub.previousPrice ?? sub.price),
                          locale,
                          sub.currency,
                        ),
                        old: formatCurrency(sub.previousPrice ?? 0, locale, sub.currency),
                      })}
                    </span>
                  }
                  trailing={
                    <span className="font-mono text-sm font-medium tabular-nums text-navy">
                      {formatCurrency(sub.price, locale, sub.currency)}
                    </span>
                  }
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AddCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-emerald-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      {label}
    </button>
  );
}

function ChangePill({
  change,
  locale,
  currency,
  t,
}: {
  change: number;
  locale: string;
  currency: string;
  t: ReturnType<typeof useTranslations>;
}) {
  if (Math.abs(change) < 0.005) {
    return (
      <span className="mb-1 inline-flex items-center rounded-full bg-navy/5 px-2 py-0.5 text-xs font-medium text-navy/55">
        {t("changeNone")}
      </span>
    );
  }
  const up = change > 0;
  const amount = formatCurrency(Math.abs(change), locale, currency);
  return (
    <span
      className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        up ? "bg-amber/10 text-amber-ink" : "bg-emerald/10 text-emerald-ink"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      <span className="font-mono">{amount}</span>
    </span>
  );
}

function Stat({
  label,
  value,
  footer,
  last,
  hidden,
}: {
  label: string;
  value?: React.ReactNode;
  footer?: React.ReactNode;
  last?: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div
      className={`flex-1 px-6 py-4 sm:px-7 ${last ? "" : "border-b border-navy/[0.07]"}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-navy/55">
        {label}
      </p>
      <div className="mt-1.5 text-xl font-semibold text-navy">{value}</div>
      {footer && <div className="mt-1.5">{footer}</div>}
    </div>
  );
}

function AttentionRow({
  sub,
  detail,
  trailing,
  onClick,
}: {
  sub: Subscription;
  detail: React.ReactNode;
  trailing: React.ReactNode;
  onClick: () => void;
}) {
  const due = isDue(sub);
  // A plain div (not a <button>) so the due-action buttons can nest validly.
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-navy/[0.03] focus-visible:bg-navy/[0.04]"
      >
        <SubLogo sub={sub} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy">{sub.name}</p>
          {detail}
          {due && <DueActions sub={sub} className="mt-2" />}
        </div>
        {trailing}
      </div>
    </li>
  );
}
