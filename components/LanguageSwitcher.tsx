"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCookie } from "@/lib/cookies";

const LOCALES = ["en", "cs"] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: string) => {
    if (next === locale) return;
    setCookie("NEXT_LOCALE", next);
    startTransition(() => router.refresh());
  };

  return (
    <div
      className="inline-flex items-center rounded-lg border border-navy/10 p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          disabled={isPending}
          aria-pressed={l === locale}
          className={`cursor-pointer rounded-md px-2 py-1 uppercase transition-colors ${
            l === locale
              ? "bg-navy text-paper"
              : "text-navy/60 hover:text-navy"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
