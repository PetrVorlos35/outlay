"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Mode = "signIn" | "signUp";

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function AuthScreen({ mode }: { mode: Mode }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { signIn } = useAuthActions();

  const isSignUp = mode === "signUp";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelPoints = [
    { Icon: Wallet, text: t("panelPoint1") },
    { Icon: Bell, text: t("panelPoint2") },
    { Icon: TrendingUp, text: t("panelPoint3") },
  ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || googleLoading) return;
    setError(null);

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t("errorEmail"));
      return;
    }
    if (isSignUp && password.length < MIN_PASSWORD) {
      setError(t("errorPasswordShort", { min: MIN_PASSWORD }));
      return;
    }

    setSubmitting(true);
    try {
      await signIn("password", {
        email: trimmedEmail,
        password,
        flow: mode,
        ...(isSignUp ? { name: name.trim() } : {}),
      });
      router.push("/dashboard");
    } catch {
      setError(isSignUp ? t("errorSignUp") : t("errorSignIn"));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (submitting || googleLoading) return;
    setError(null);
    setGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: "/dashboard" });
    } catch {
      setError(t("errorGeneric"));
      setGoogleLoading(false);
    }
  }

  const busy = submitting || googleLoading;

  return (
    <div className="relative min-h-screen bg-paper lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — the one deliberate dark surface, echoing the landing CTA band */}
      <aside className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="bg-grid-light pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
          aria-hidden
        />
        {/* soft emerald glow */}
        <div
          className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-emerald/20 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative w-fit" aria-label="outlay home">
          <Wordmark tone="paper" />
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-[1.15] tracking-tight text-paper xl:text-4xl">
            {t("panelTitle")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-paper/60">
            {t("panelBody")}
          </p>

          <ul className="mt-10 space-y-4">
            {panelPoints.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper/10 text-emerald">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
                <span className="text-[15px] text-paper/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-paper/40">{t("panelFooter")}</p>
      </aside>

      {/* Form column */}
      <main className="relative flex min-h-screen flex-col">
        <div
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)] lg:hidden"
          aria-hidden
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-navy/60 transition-colors hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backHome")}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Card */}
        <div className="relative flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10">
          <div className="animate-fade-up w-full max-w-sm">
            {/* Wordmark only shows here on mobile, where the panel is hidden */}
            <Link href="/" className="mb-8 inline-flex lg:hidden" aria-label="outlay home">
              <Wordmark />
            </Link>

            <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
              {isSignUp ? t("signUpTitle") : t("signInTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-navy/60">
              {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="mt-7 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-navy/15 bg-white px-4 text-sm font-medium text-navy transition-colors hover:border-navy/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="h-[18px] w-[18px]" />
              )}
              {t("google")}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-navy/10" />
              <span className="text-xs font-medium uppercase tracking-wide text-navy/40">
                {t("or")}
              </span>
              <span className="h-px flex-1 bg-navy/10" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {isSignUp && (
                <Field
                  id="name"
                  label={t("name")}
                  type="text"
                  autoComplete="name"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    if (error) setError(null);
                  }}
                  disabled={busy}
                />
              )}

              <Field
                id="email"
                label={t("email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (error) setError(null);
                }}
                disabled={busy}
              />

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-navy"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={busy}
                    className="h-11 w-full rounded-xl border border-navy/15 bg-white pl-3.5 pr-11 text-sm text-navy placeholder:text-navy/40 transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-navy/40 transition-colors hover:text-navy"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isSignUp && (
                  <p className="mt-1.5 text-xs text-navy/50">{t("passwordHint", { min: MIN_PASSWORD })}</p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-ink/20 bg-amber/5 px-3 py-2 text-sm text-amber-ink"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? t("signUpCta") : t("signInCta")}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-navy/60">
              {isSignUp ? t("haveAccount") : t("noAccount")}{" "}
              <Link
                href={isSignUp ? "/signin" : "/signup"}
                className="font-medium text-emerald-ink underline-offset-4 hover:underline"
              >
                {isSignUp ? t("signInLink") : t("signUpLink")}
              </Link>
            </p>

            {isSignUp && (
              <p className="mt-6 text-center text-xs leading-relaxed text-navy/45">
                {t("terms")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  disabled,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "value" | "onChange" | "disabled"
>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-navy/15 bg-white px-3.5 text-sm text-navy placeholder:text-navy/40 transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:opacity-60"
        {...rest}
      />
    </div>
  );
}
