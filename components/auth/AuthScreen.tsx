"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  MailCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const OTP_LENGTH = 6;
// Must stay >= the server-side `sendOtp` window in convex/rateLimits.ts so the
// button only re-enables once the server will actually accept another send.
const RESEND_COOLDOWN = 30;

type Mode = "signIn" | "signUp";
type Phase = "credentials" | "verifyEmail" | "resetRequest" | "resetVerify";

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

  const [phase, setPhase] = useState<Phase>("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const busy = submitting || googleLoading;

  // Tick the resend cooldown down to zero, one second at a time.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const panelPoints = [
    { Icon: Wallet, text: t("panelPoint1") },
    { Icon: Bell, text: t("panelPoint2") },
    { Icon: TrendingUp, text: t("panelPoint3") },
  ];

  function goTo(next: Phase) {
    setError(null);
    setNotice(null);
    setPhase(next);
  }

  // ── Credentials (sign in / sign up) ───────────────────────────────────────
  async function handleCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
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
      if (isSignUp) {
        // Account created; a verification code was emailed. Move to the code step.
        setSubmitting(false);
        goTo("verifyEmail");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(isSignUp ? t("errorSignUp") : t("errorSignIn"));
      setSubmitting(false);
    }
  }

  // ── Verify email (after sign up) ──────────────────────────────────────────
  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || code.trim().length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", {
        email: email.trim(),
        code: code.trim(),
        flow: "email-verification",
      });
      router.push("/dashboard");
    } catch {
      setError(t("errorVerify"));
      setSubmitting(false);
    }
  }

  // ── Password reset: request a code ────────────────────────────────────────
  async function handleResetRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError(t("errorEmail"));
      return;
    }

    setSubmitting(true);
    try {
      await signIn("password", { email: trimmedEmail, flow: "reset" });
      setSubmitting(false);
      goTo("resetVerify");
      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      setError(t("errorGeneric"));
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (busy || resendCooldown > 0) return;
    setError(null);
    try {
      await signIn("password", { email: email.trim(), flow: "reset" });
      setNotice(t("codeResent"));
      setResendCooldown(RESEND_COOLDOWN);
    } catch {
      setError(t("errorGeneric"));
    }
  }

  // ── Password reset: verify code + set new password ────────────────────────
  async function handleResetVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (newPassword.length < MIN_PASSWORD) {
      setError(t("errorPasswordShort", { min: MIN_PASSWORD }));
      return;
    }

    setSubmitting(true);
    try {
      await signIn("password", {
        email: email.trim(),
        code: code.trim(),
        newPassword,
        flow: "reset-verification",
      });
      router.push("/dashboard");
    } catch {
      setError(t("errorReset"));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setError(null);
    setGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: "/dashboard" });
    } catch {
      setError(t("errorGeneric"));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-paper lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="bg-grid-light pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
          aria-hidden
        />
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

        <div className="relative flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:px-10">
          <div className="animate-fade-up w-full max-w-sm">
            <Link href="/" className="mb-8 inline-flex lg:hidden" aria-label="outlay home">
              <Wordmark />
            </Link>

            {phase === "credentials" && (
              <CredentialsForm
                t={t}
                isSignUp={isSignUp}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                submitting={submitting}
                googleLoading={googleLoading}
                busy={busy}
                error={error}
                onSubmit={handleCredentials}
                onGoogle={handleGoogle}
                onForgot={() => goTo("resetRequest")}
                clearError={() => error && setError(null)}
              />
            )}

            {phase === "verifyEmail" && (
              <CodeForm
                icon={<MailCheck className="h-6 w-6" />}
                title={t("verifyTitle")}
                subtitle={t("verifySubtitle", { email: email.trim() })}
                codeLabel={t("code")}
                code={code}
                setCode={setCode}
                cta={t("verifyCta")}
                submitting={submitting}
                busy={busy}
                error={error}
                notice={notice}
                onSubmit={handleVerify}
                onBack={() => {
                  setCode("");
                  goTo("credentials");
                }}
                backLabel={t("backToSignIn")}
                clearError={() => error && setError(null)}
              />
            )}

            {phase === "resetRequest" && (
              <ResetRequestForm
                t={t}
                email={email}
                setEmail={setEmail}
                submitting={submitting}
                busy={busy}
                error={error}
                onSubmit={handleResetRequest}
                onBack={() => goTo("credentials")}
                clearError={() => error && setError(null)}
              />
            )}

            {phase === "resetVerify" && (
              <ResetVerifyForm
                t={t}
                email={email}
                code={code}
                setCode={setCode}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                submitting={submitting}
                busy={busy}
                error={error}
                notice={notice}
                resendCooldown={resendCooldown}
                onSubmit={handleResetVerify}
                onResend={handleResend}
                onBack={() => goTo("credentials")}
                clearError={() => error && setError(null)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type T = ReturnType<typeof useTranslations>;

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-amber-ink/20 bg-amber/5 px-3 py-2 text-sm text-amber-ink"
    >
      {children}
    </p>
  );
}

function SubmitButton({
  submitting,
  busy,
  label,
}: {
  submitting: boolean;
  busy: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-70"
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function CredentialsForm({
  t,
  isSignUp,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  submitting,
  googleLoading,
  busy,
  error,
  onSubmit,
  onGoogle,
  onForgot,
  clearError,
}: {
  t: T;
  isSignUp: boolean;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (fn: (s: boolean) => boolean) => void;
  submitting: boolean;
  googleLoading: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  onForgot: () => void;
  clearError: () => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
        {isSignUp ? t("signUpTitle") : t("signInTitle")}
      </h1>
      <p className="mt-2 text-[15px] text-navy/60">
        {isSignUp ? t("signUpSubtitle") : t("signInSubtitle")}
      </p>

      <button
        type="button"
        onClick={onGoogle}
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

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-navy/10" />
        <span className="text-xs font-medium uppercase tracking-wide text-navy/40">
          {t("or")}
        </span>
        <span className="h-px flex-1 bg-navy/10" />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
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
              clearError();
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
            clearError();
          }}
          disabled={busy}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-navy">
              {t("password")}
            </label>
            {!isSignUp && (
              <button
                type="button"
                onClick={onForgot}
                className="text-xs font-medium text-emerald-ink underline-offset-4 hover:underline"
              >
                {t("forgotPassword")}
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isSignUp && (
            <p className="mt-1.5 text-xs text-navy/50">
              {t("passwordHint", { min: MIN_PASSWORD })}
            </p>
          )}
        </div>

        {error && <ErrorNote>{error}</ErrorNote>}

        <SubmitButton
          submitting={submitting}
          busy={busy}
          label={isSignUp ? t("signUpCta") : t("signInCta")}
        />
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
    </>
  );
}

function CodeForm({
  icon,
  title,
  subtitle,
  codeLabel,
  code,
  setCode,
  cta,
  submitting,
  busy,
  error,
  notice,
  onSubmit,
  onBack,
  backLabel,
  onResend,
  resendLabel,
  resendDisabled,
  clearError,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  codeLabel: string;
  code: string;
  setCode: (v: string) => void;
  cta: string;
  submitting: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  backLabel: string;
  onResend?: () => void;
  resendLabel?: string;
  resendDisabled?: boolean;
  clearError: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald-ink">
        {icon}
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-navy/60">{subtitle}</p>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        <CodeField
          label={codeLabel}
          value={code}
          onChange={(v) => {
            setCode(v);
            clearError();
          }}
          disabled={busy}
        />

        {children}

        {error && <ErrorNote>{error}</ErrorNote>}
        {notice && !error && (
          <p className="rounded-lg border border-emerald-ink/20 bg-emerald/5 px-3 py-2 text-sm text-emerald-ink">
            {notice}
          </p>
        )}

        <SubmitButton submitting={submitting} busy={busy} label={cta} />
      </form>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-navy/60 transition-colors hover:text-navy"
        >
          {backLabel}
        </button>
        {onResend && resendLabel && (
          <>
            <span className="text-navy/20">·</span>
            <button
              type="button"
              onClick={onResend}
              disabled={busy || resendDisabled}
              className="font-medium text-emerald-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
            >
              {resendLabel}
            </button>
          </>
        )}
      </div>
    </>
  );
}

function ResetRequestForm({
  t,
  email,
  setEmail,
  submitting,
  busy,
  error,
  onSubmit,
  onBack,
  clearError,
}: {
  t: T;
  email: string;
  setEmail: (v: string) => void;
  submitting: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  clearError: () => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem]">
        {t("resetTitle")}
      </h1>
      <p className="mt-2 text-[15px] text-navy/60">{t("resetSubtitle")}</p>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-4">
        <Field
          id="reset-email"
          label={t("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError();
          }}
          disabled={busy}
        />

        {error && <ErrorNote>{error}</ErrorNote>}

        <SubmitButton submitting={submitting} busy={busy} label={t("resetCta")} />
      </form>

      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-navy/60 transition-colors hover:text-navy"
        >
          {t("backToSignIn")}
        </button>
      </div>
    </>
  );
}

function ResetVerifyForm({
  t,
  email,
  code,
  setCode,
  newPassword,
  setNewPassword,
  showPassword,
  setShowPassword,
  submitting,
  busy,
  error,
  notice,
  resendCooldown,
  onSubmit,
  onResend,
  onBack,
  clearError,
}: {
  t: T;
  email: string;
  code: string;
  setCode: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (fn: (s: boolean) => boolean) => void;
  submitting: boolean;
  busy: boolean;
  error: string | null;
  notice: string | null;
  resendCooldown: number;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onBack: () => void;
  clearError: () => void;
}) {
  return (
    <CodeForm
      icon={<MailCheck className="h-6 w-6" />}
      title={t("resetVerifyTitle")}
      subtitle={t("resetVerifySubtitle", { email: email.trim() })}
      codeLabel={t("code")}
      code={code}
      setCode={setCode}
      cta={t("resetVerifyCta")}
      submitting={submitting}
      busy={busy}
      error={error}
      notice={notice}
      onSubmit={onSubmit}
      onBack={onBack}
      backLabel={t("backToSignIn")}
      onResend={onResend}
      resendLabel={
        resendCooldown > 0
          ? t("resendIn", { seconds: resendCooldown })
          : t("resendCode")
      }
      resendDisabled={resendCooldown > 0}
      clearError={clearError}
    >
      <div>
        <label
          htmlFor="new-password"
          className="mb-1.5 block text-sm font-medium text-navy"
        >
          {t("newPassword")}
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearError();
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-navy/50">
          {t("passwordHint", { min: MIN_PASSWORD })}
        </p>
      </div>
    </CodeForm>
  );
}

// One box per digit, the classic OTP layout. Typing auto-advances, Backspace
// steps back, arrows move between boxes, and pasting a full code fills them all.
// The value is still a single string, so callers are unchanged.
function CodeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  function focusBox(index: number) {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }

  // Spread any incoming characters (single keystroke, autofill, or a paste that
  // lands in one box) across the boxes starting at `index`.
  function handleChange(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    const next = digits.slice();
    if (clean === "") {
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    let cursor = index;
    for (const ch of clean.split("")) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor++;
    }
    onChange(next.join("").slice(0, OTP_LENGTH));
    focusBox(Math.min(cursor, OTP_LENGTH - 1));
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.slice();
      if (digits[index]) {
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next.join(""));
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <div>
      <span id="otp-label" className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </span>
      <div className="flex gap-2 sm:gap-2.5" role="group" aria-labelledby="otp-label">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            aria-label={`${label} ${i + 1}`}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className="h-12 w-full min-w-0 rounded-xl border border-navy/15 bg-white text-center font-mono text-lg text-navy transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30 disabled:opacity-60"
          />
        ))}
      </div>
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
