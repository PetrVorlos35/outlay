"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import {
  daysUntil,
  hasPriceHike,
  monthlyAmount,
  type SubStatus,
  type Subscription,
} from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/format";
import { useDashboard } from "./DashboardProvider";
import SubLogo from "./SubLogo";
import RenewalBadge from "./RenewalBadge";

type SortKey = "name" | "price" | "renewal";
type Filter = "all" | SubStatus;

export default function SubscriptionTable() {
  const t = useTranslations("dashboard.table");
  const tc = useTranslations("dashboard.cycleShort");
  const tcat = useTranslations("dashboard.category");
  const ts = useTranslations("dashboard.status");
  const locale = useLocale();
  const { subscriptions, openEdit } = useDashboard();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "renewal",
    dir: 1,
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = subscriptions.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sort.key === "name") cmp = a.name.localeCompare(b.name);
      else if (sort.key === "price")
        cmp = monthlyAmount(a.price, a.cycle) - monthlyAmount(b.price, b.cycle);
      else cmp = daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal);
      return cmp * sort.dir;
    });
    return list;
  }, [subscriptions, query, filter, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 },
    );
  }

  const filters: Filter[] = ["all", "active", "paused"];

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-navy/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search")}
            className="h-10 w-full rounded-xl border border-navy/15 bg-white pl-9 pr-9 text-sm text-navy placeholder:text-navy/40 transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("clearSearch")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-navy/40 transition-colors hover:bg-navy/[0.05] hover:text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="inline-flex shrink-0 rounded-xl border border-navy/15 bg-white p-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-navy text-paper"
                  : "text-navy/60 hover:text-navy"
              }`}
            >
              {f === "all" ? t("filterAll") : f === "active" ? t("filterActive") : t("filterPaused")}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
          <p className="text-sm text-navy/55">{t("noResults")}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-navy/15 bg-white px-3 text-sm font-medium text-navy transition-colors hover:border-navy/30"
          >
            {t("clearSearch")}
          </button>
        </div>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-xs font-medium uppercase tracking-wide text-navy/50">
              <Th onClick={() => toggleSort("name")} sort={sort} col="name">
                {t("name")}
              </Th>
              <Th className="hidden md:table-cell">{t("cycle")}</Th>
              <Th
                className="hidden lg:table-cell"
                onClick={() => toggleSort("price")}
                sort={sort}
                col="price"
                align="right"
              >
                {t("monthly")}
              </Th>
              <Th
                className="hidden sm:table-cell"
                onClick={() => toggleSort("renewal")}
                sort={sort}
                col="renewal"
              >
                {t("renewal")}
              </Th>
              <Th align="right">{t("price")}</Th>
              <Th className="hidden md:table-cell" align="right">
                {t("status")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((sub) => (
              <Row
                key={sub.id}
                sub={sub}
                locale={locale}
                onClick={() => openEdit(sub)}
                editLabel={t("edit", { name: sub.name })}
                cycleLabel={tc(sub.cycle)}
                categoryLabel={tcat(sub.category)}
                statusLabel={ts(sub.status)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
  align = "left",
  onClick,
  sort,
  col,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  onClick?: () => void;
  sort?: { key: SortKey; dir: 1 | -1 };
  col?: SortKey;
}) {
  const active = sort && col && sort.key === col;
  const content = (
    <span
      className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      {children}
      {active &&
        (sort!.dir === 1 ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        ))}
    </span>
  );
  return (
    <th
      className={`px-4 py-3 font-medium sm:px-5 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-navy ${active ? "text-navy" : ""}`}
        >
          {content}
        </button>
      ) : (
        content
      )}
    </th>
  );
}

function Row({
  sub,
  locale,
  onClick,
  editLabel,
  cycleLabel,
  categoryLabel,
  statusLabel,
}: {
  sub: Subscription;
  locale: string;
  onClick: () => void;
  editLabel: string;
  cycleLabel: string;
  categoryLabel: string;
  statusLabel: string;
}) {
  const paused = sub.status === "paused";
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={editLabel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer border-t border-navy/[0.06] outline-none transition-colors hover:bg-navy/[0.025] focus-visible:bg-navy/[0.04]"
    >
      {/* Service */}
      <td className="px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <SubLogo sub={sub} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`truncate text-sm font-medium ${paused ? "text-navy/50" : "text-navy"}`}
              >
                {sub.name}
              </span>
              {hasPriceHike(sub) && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" title="Price increased" aria-hidden />
              )}
            </div>
            <span className="hidden text-xs text-navy/45 sm:block">
              {categoryLabel}
            </span>
            {/* On mobile the dedicated renewal column is hidden; surface it here. */}
            <div className="mt-0.5 sm:hidden">
              {paused ? (
                <span className="text-xs text-navy/40">{categoryLabel}</span>
              ) : (
                <RenewalBadge iso={sub.nextRenewal} />
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Cycle */}
      <td className="hidden px-4 py-3 text-sm text-navy/65 sm:px-5 md:table-cell">
        {cycleLabel.replace("/", "")}
      </td>

      {/* Monthly */}
      <td className="hidden px-4 py-3 text-right font-mono text-sm tabular-nums text-navy/65 sm:px-5 lg:table-cell">
        {formatCurrency(monthlyAmount(sub.price, sub.cycle), locale)}
      </td>

      {/* Next renewal (folded into the Service cell on mobile) */}
      <td className="hidden px-4 py-3 sm:table-cell sm:px-5">
        {paused ? (
          <span className="text-xs text-navy/40">—</span>
        ) : (
          <RenewalBadge iso={sub.nextRenewal} withDate />
        )}
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right sm:px-5">
        <span
          className={`font-mono text-sm font-medium tabular-nums ${paused ? "text-navy/50" : "text-navy"}`}
        >
          {formatCurrency(sub.price, locale)}
        </span>
      </td>

      {/* Status */}
      <td className="hidden px-4 py-3 text-right sm:px-5 md:table-cell">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            paused
              ? "bg-navy/[0.05] text-navy/55"
              : "bg-emerald/10 text-emerald-ink"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${paused ? "bg-navy/30" : "bg-emerald"}`}
            aria-hidden
          />
          {statusLabel}
        </span>
      </td>
    </tr>
  );
}
