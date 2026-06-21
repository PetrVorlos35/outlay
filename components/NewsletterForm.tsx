"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const t = useTranslations("newsletter");
  const join = useMutation(api.waitlist.join);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await join({ email: trimmed });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-sm text-navy/70">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-ink text-paper">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-xs">
      <label htmlFor="newsletter-email" className="sr-only">
        {t("placeholder")}
      </label>
      <div className="flex items-center gap-2">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("placeholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          className="h-10 w-full flex-1 rounded-lg border border-navy/15 bg-white px-3 text-sm text-navy placeholder:text-navy/60 transition-colors focus:border-emerald-ink focus:outline-none focus:ring-2 focus:ring-emerald-ink/30"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label={t("subscribe")}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-navy text-paper transition-colors hover:bg-navy/90 disabled:opacity-70"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className={`mt-2 text-xs ${status === "error" ? "text-amber-ink" : "text-navy/60"}`}>
        {status === "error" ? t("error") : t("helper")}
      </p>
    </form>
  );
}
