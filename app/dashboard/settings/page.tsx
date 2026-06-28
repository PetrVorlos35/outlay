"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  currencyForLocale,
  CURRENCY_SYMBOL,
  type CurrencyCode,
} from "@/lib/currency";
import { PageHeader, Panel } from "@/components/dashboard/primitives";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import PageTitle from "@/components/dashboard/PageTitle";

const CURRENCY_OPTIONS: CurrencyCode[] = ["USD", "EUR", "CZK", "GBP"];

export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");
  const tn = useTranslations("dashboard.nav");
  const toast = useTranslations("dashboard.toast");
  const router = useRouter();
  const locale = useLocale();
  const { signOut } = useAuthActions();
  const { notify } = useDashboard();
  const viewer = useQuery(api.users.viewer);

  const [name, setName] = useState("");

  // Per-user notification preferences from Convex.
  const prefs = useQuery(api.preferences.get);
  const setPrefs = useMutation(api.preferences.set);
  const prefsLoading = prefs === undefined;
  const lead = String(prefs?.reminderLeadDays ?? 3);
  const priceHike = prefs?.priceHikeAlerts ?? true;
  const weekly = prefs?.weeklySummary ?? false;
  // Currency is independent of language; until chosen it follows the locale.
  const currency = (prefs?.currency as CurrencyCode | undefined) ?? currencyForLocale(locale);

  const saved = () => notify(toast("saved"));

  function updatePrefs(
    patch: Partial<{
      reminderLeadDays: 1 | 3 | 7;
      priceHikeAlerts: boolean;
      weeklySummary: boolean;
      currency: CurrencyCode;
    }>,
  ) {
    void setPrefs(patch).then(saved);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <PageTitle section={tn("settings")} />
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="space-y-6">
        {/* Profile */}
        <Panel title={t("profileTitle")} subtitle={t("profileSubtitle")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("name")} htmlFor="set-name">
              <input
                id="set-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.trim() && saved()}
                placeholder={viewer?.name ?? ""}
                className={inputCls}
              />
            </Field>
            <Field label={t("email")} htmlFor="set-email">
              <input
                id="set-email"
                type="email"
                value={viewer?.email ?? ""}
                readOnly
                disabled
                className={`${inputCls} cursor-not-allowed text-navy/55`}
              />
            </Field>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title={t("notifTitle")} subtitle={t("notifSubtitle")}>
          <div className="divide-y divide-navy/[0.07]">
            <Row label={t("leadTime")} hint={t("leadTimeHint")}>
              <select
                value={lead}
                disabled={prefsLoading}
                onChange={(e) =>
                  updatePrefs({ reminderLeadDays: Number(e.target.value) as 1 | 3 | 7 })
                }
                className="h-10 cursor-pointer rounded-xl border border-navy/15 bg-white px-3 text-sm text-navy transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:opacity-60"
              >
                <option value="1">{t("lead1")}</option>
                <option value="3">{t("lead3")}</option>
                <option value="7">{t("lead7")}</option>
              </select>
            </Row>
            <Row label={t("priceHike")} hint={t("priceHikeHint")}>
              <Toggle
                checked={priceHike}
                disabled={prefsLoading}
                onChange={(v) => updatePrefs({ priceHikeAlerts: v })}
                label={t("priceHike")}
              />
            </Row>
            <Row label={t("weekly")} hint={t("weeklyHint")}>
              <Toggle
                checked={weekly}
                disabled={prefsLoading}
                onChange={(v) => updatePrefs({ weeklySummary: v })}
                label={t("weekly")}
              />
            </Row>
          </div>
        </Panel>

        {/* Currency */}
        <Panel title={t("currencyTitle")} subtitle={t("currencySubtitle")}>
          <Row label={t("currencyLabel")} hint={t("currencyHint")}>
            <select
              value={currency}
              disabled={prefsLoading}
              onChange={(e) =>
                updatePrefs({ currency: e.target.value as CurrencyCode })
              }
              className="h-10 cursor-pointer rounded-xl border border-navy/15 bg-white px-3 text-sm text-navy transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:opacity-60"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c} — {CURRENCY_SYMBOL[c]}
                </option>
              ))}
            </select>
          </Row>
        </Panel>

        {/* Language */}
        <Panel title={t("langTitle")} subtitle={t("langSubtitle")}>
          <Row label={t("langTitle")} hint={t("langSubtitle")}>
            <LanguageSwitcher />
          </Row>
        </Panel>

        {/* Account */}
        <Panel title={t("dangerTitle")} subtitle={t("dangerSubtitle")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-4 text-sm font-medium text-navy transition-colors hover:border-navy/30"
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
            <button
              type="button"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              {t("deleteAccount")}
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-navy/15 bg-white px-3.5 text-sm text-navy placeholder:text-navy/40 transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
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
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="mt-0.5 text-sm text-navy/55">{hint}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-emerald-ink" : "bg-navy/20"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
