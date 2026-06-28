"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, X } from "lucide-react";
import {
  BILLING_CYCLES,
  CATEGORIES,
  type BillingCycle,
  type Category,
  type SubStatus,
} from "@/lib/subscriptions";
import {
  searchCatalog,
  findCatalogByName,
  catalogPrice,
  logoUrl,
  guessLogoUrl,
  type CatalogEntry,
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { CURRENCY_SYMBOL } from "@/lib/currency";
import { useDashboard } from "./DashboardProvider";
import { useAccountCurrency } from "./useAccountCurrency";
import { useCatalog } from "./useCatalog";
import SubLogo from "./SubLogo";

// Palette for newly-added subscriptions (mock seeds carry real brand colors).
const NEW_COLORS = [
  "#047857",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#0891B2",
  "#CA8A04",
  "#475569",
];
function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return NEW_COLORS[Math.abs(h) % NEW_COLORS.length];
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type Fields = {
  name: string;
  price: string;
  cycle: BillingCycle;
  category: Category;
  nextRenewal: string;
  status: SubStatus;
  color: string;
  logo?: string;
};

const BLANK: Fields = {
  name: "",
  price: "",
  cycle: "monthly",
  category: "other",
  nextRenewal: todayPlus(30),
  status: "active",
  color: "",
};

export default function SubscriptionDrawer() {
  const t = useTranslations("dashboard.form");
  const tc = useTranslations("dashboard.cycle");
  const tcat = useTranslations("dashboard.category");
  const ts = useTranslations("dashboard.status");
  const locale = useLocale();
  // The account's chosen display currency (catalog prices convert to it on
  // prefill). Editing an existing sub keeps whatever currency it was saved in.
  const accountCurrency = useAccountCurrency();
  const { entries: catalogEntries } = useCatalog();
  const {
    drawer,
    closeDrawer,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  } = useDashboard();

  const { open, editing } = drawer;
  const isEdit = editing !== null;

  const [fields, setFields] = useState<Fields>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Initialize the form the moment the drawer transitions to open. Adjusting
  // state during render (guarded by the open transition) is the React-blessed
  // alternative to a setState-in-effect.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setErrors({});
      setSubmitting(false);
      setConfirmDelete(false);
      setComboOpen(false);
      setActiveIndex(-1);
      setFields(
        editing
          ? {
              name: editing.name,
              price: String(editing.price),
              cycle: editing.cycle,
              category: editing.category,
              nextRenewal: editing.nextRenewal,
              status: editing.status,
              color: editing.color,
              logo: editing.logo,
            }
          : BLANK,
      );
    }
  }

  // Catalog suggestions (add mode only); shown inline so the scroll container
  // never clips them.
  const suggestions =
    !isEdit && comboOpen ? searchCatalog(fields.name, catalogEntries) : [];
  const showSuggestions = suggestions.length > 0;

  // DOM side-effects while open: capture focus, lock scroll, Esc to close,
  // focus the first field, and restore focus on close.
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const focusId = window.setTimeout(() => nameRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusId);
      // Restore focus to a real, still-mounted trigger. If there isn't one
      // (e.g. the drawer was opened by the "n" shortcut, where the trigger was
      // <body>), explicitly blur whatever is focused so focus doesn't linger on
      // the now-hidden name input and swallow subsequent keystrokes.
      const target = restoreFocus.current;
      if (
        target &&
        target !== document.body &&
        target.isConnected &&
        typeof target.focus === "function"
      ) {
        target.focus();
      } else {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
    };
  }, [open, closeDrawer]);

  // Simple focus trap within the panel.
  function onPanelKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Typing a name (add mode): if it exactly matches a catalog service, use that
  // service's real logo and brand color; otherwise treat it as a custom entry and
  // guess a brand logo from the name (monogram fallback if it 404s). Keep the
  // suggestion list open either way.
  function handleNameChange(value: string) {
    const match = findCatalogByName(value, catalogEntries);
    setFields((f) => ({
      ...f,
      name: value,
      logo: match ? logoUrl(match.domain) : guessLogoUrl(value),
      color: match ? match.color : colorFor(value),
    }));
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
    setComboOpen(true);
    setActiveIndex(-1);
  }

  function selectCatalog(entry: CatalogEntry) {
    setFields((f) => ({
      ...f,
      name: entry.name,
      price: String(catalogPrice(entry, accountCurrency)),
      cycle: entry.cycle,
      category: entry.category,
      color: entry.color,
      logo: logoUrl(entry.domain),
    }));
    setErrors((e) => ({ ...e, name: undefined, price: undefined }));
    setComboOpen(false);
    setActiveIndex(-1);
  }

  function onNameKeyDown(e: React.KeyboardEvent) {
    if (isEdit) return;
    if (!showSuggestions) {
      if (e.key === "ArrowDown") setComboOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectCatalog(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      // Close the list without letting Escape bubble up and close the drawer.
      e.preventDefault();
      e.stopPropagation();
      setComboOpen(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const next: Partial<Record<keyof Fields, string>> = {};
    const name = fields.name.trim();
    const price = parseFloat(fields.price);
    if (!name) next.name = t("errName");
    if (!fields.price || isNaN(price) || price <= 0) next.price = t("errPrice");
    if (!fields.nextRenewal) next.nextRenewal = t("errDate");
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const draft = {
      name,
      price,
      cycle: fields.cycle,
      category: fields.category,
      nextRenewal: fields.nextRenewal,
      status: fields.status,
      color: fields.color || editing?.color || colorFor(name),
      logo: fields.logo,
      currency: editing?.currency ?? accountCurrency,
      previousPrice: editing?.previousPrice,
    };

    setSubmitting(true);
    const ok = editing
      ? await updateSubscription(editing.id, draft)
      : await addSubscription(draft);
    setSubmitting(false);
    // On failure the provider already toasted the error; keep the drawer open
    // with the user's input intact so they can retry.
    if (ok) closeDrawer();
  }

  async function handleDelete() {
    if (!editing || submitting) return;
    setSubmitting(true);
    const ok = await deleteSubscription(editing.id, editing.name);
    setSubmitting(false);
    if (ok) closeDrawer();
  }

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-navy/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={open ? titleId : undefined}
        onKeyDown={onPanelKeyDown}
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-[0_0_60px_-15px_rgba(11,18,32,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/10 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {(isEdit || fields.name.trim()) && (
              <SubLogo
                sub={{
                  name: fields.name || "?",
                  color: fields.color || "#047857",
                  logo: fields.logo,
                }}
                size="lg"
              />
            )}
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-tight text-navy"
              >
                {isEdit ? t("editTitle") : t("addTitle")}
              </h2>
              <p className="mt-0.5 truncate text-sm text-navy/55">
                {isEdit && editing
                  ? t("editSubtitle", { name: editing.name })
                  : t("addSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t("cancel")}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-navy/50 transition-colors hover:bg-navy/[0.05] hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form
          id="sub-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
        >
          <FieldShell label={t("name")} error={errors.name} htmlFor="sub-name">
            <div className="relative">
              <input
                ref={nameRef}
                id="sub-name"
                type="text"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls="sub-name-list"
                aria-autocomplete="list"
                autoComplete="off"
                value={fields.name}
                onChange={(e) =>
                  isEdit
                    ? set("name", e.target.value)
                    : handleNameChange(e.target.value)
                }
                onFocus={() => !isEdit && setComboOpen(true)}
                onKeyDown={onNameKeyDown}
                placeholder={t("namePlaceholder")}
                className={inputCls(!!errors.name)}
              />

              {showSuggestions && (
                <ul
                  id="sub-name-list"
                  role="listbox"
                  className="mt-1.5 overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_8px_24px_-12px_rgba(11,18,32,0.25)]"
                >
                  {suggestions.map((entry, i) => (
                    <li
                      key={`${entry.name}-${entry.domain}`}
                      role="option"
                      aria-selected={i === activeIndex}
                    >
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectCatalog(entry);
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors ${
                          i === activeIndex
                            ? "bg-navy/[0.04]"
                            : "hover:bg-navy/[0.03]"
                        }`}
                      >
                        <SubLogo
                          sub={{
                            name: entry.name,
                            color: entry.color,
                            logo: logoUrl(entry.domain),
                          }}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                          {entry.name}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-navy/55">
                          {formatCurrency(
                            catalogPrice(entry, accountCurrency),
                            locale,
                            accountCurrency,
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!isEdit && !showSuggestions && (
                <p className="mt-1.5 text-xs text-navy/45">{t("pickHint")}</p>
              )}
            </div>
          </FieldShell>

          <div className="grid grid-cols-2 gap-4">
            <FieldShell
              label={t("price")}
              error={errors.price}
              htmlFor="sub-price"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-navy/45">
                  {CURRENCY_SYMBOL[accountCurrency]}
                </span>
                <input
                  id="sub-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={fields.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls(!!errors.price)} font-mono tabular-nums ${
                    CURRENCY_SYMBOL[accountCurrency].length > 1 ? "pl-9" : "pl-7"
                  }`}
                />
              </div>
            </FieldShell>

            <FieldShell label={t("cycle")} htmlFor="sub-cycle">
              <select
                id="sub-cycle"
                value={fields.cycle}
                onChange={(e) => set("cycle", e.target.value as BillingCycle)}
                className={selectCls}
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {tc(c)}
                  </option>
                ))}
              </select>
            </FieldShell>
          </div>

          <FieldShell label={t("category")} htmlFor="sub-category">
            <select
              id="sub-category"
              value={fields.category}
              onChange={(e) => set("category", e.target.value as Category)}
              className={selectCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tcat(c)}
                </option>
              ))}
            </select>
          </FieldShell>

          <FieldShell
            label={t("nextRenewal")}
            error={errors.nextRenewal}
            htmlFor="sub-date"
          >
            <input
              id="sub-date"
              type="date"
              value={fields.nextRenewal}
              onChange={(e) => set("nextRenewal", e.target.value)}
              className={inputCls(!!errors.nextRenewal)}
            />
          </FieldShell>

          <FieldShell label={t("status")}>
            <div className="inline-flex rounded-xl border border-navy/15 bg-white p-1">
              {(["active", "paused"] as SubStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  aria-pressed={fields.status === s}
                  className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                    fields.status === s
                      ? "bg-navy text-paper"
                      : "text-navy/60 hover:text-navy"
                  }`}
                >
                  {ts(s)}
                </button>
              ))}
            </div>
          </FieldShell>
        </form>

        {/* Footer */}
        <div className="border-t border-navy/10 bg-white px-5 py-4 sm:px-6">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-navy">
                {t("deleteConfirm")}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-9 cursor-pointer rounded-lg px-3 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/[0.05] hover:text-navy"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-red-600 px-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-default disabled:opacity-60"
                >
                  {t("deleteConfirmYes")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {isEdit ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("delete")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-10 cursor-pointer items-center rounded-xl px-3 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/[0.05] hover:text-navy"
                >
                  {t("cancel")}
                </button>
              )}
              <button
                type="submit"
                form="sub-form"
                disabled={submitting}
                className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-emerald-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-default disabled:opacity-60"
              >
                {isEdit ? t("saveEdit") : t("save")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function inputCls(error: boolean): string {
  return `h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-navy placeholder:text-navy/40 transition-colors focus:outline-none focus:ring-2 ${
    error
      ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
      : "border-navy/15 focus:border-emerald-ink focus:ring-emerald-ink/30"
  }`;
}

const selectCls =
  "h-11 w-full cursor-pointer rounded-xl border border-navy/15 bg-white px-3.5 text-sm text-navy transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30";

function FieldShell({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-navy"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
