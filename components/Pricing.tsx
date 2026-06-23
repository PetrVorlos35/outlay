import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

export default function Pricing() {
  const t = useTranslations("free");

  const features = [
    t("feature1"),
    t("feature2"),
    t("feature3"),
    t("feature4"),
  ];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl border border-navy/10 bg-white p-8 sm:p-12 lg:grid-cols-2">
        {/* Copy */}
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy/70">
            {t("body")}
          </p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-mono text-5xl font-semibold tracking-tight text-navy">
              $0
            </span>
            <span className="text-sm text-navy/60">/ {t("note")}</span>
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-emerald-ink px-6 font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper"
          >
            {t("cta")}
          </Link>
        </div>

        {/* Included features */}
        <ul className="grid gap-3 sm:grid-cols-1">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 rounded-xl border border-navy/[0.07] bg-paper px-4 py-3 text-sm text-navy/80"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                <Check className="h-3 w-3 text-emerald-ink" strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
