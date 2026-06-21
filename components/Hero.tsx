import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import ProductMock from "@/components/ProductMock";

export default function Hero() {
  const t = useTranslations("hero");

  const trust = [t("trust1"), t("trust2"), t("trust3")];

  return (
    <section className="relative overflow-hidden border-b border-navy/10">
      {/* Faint grid texture, fading out toward the bottom */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
        {/* Copy */}
        <div className="max-w-xl">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-3 py-1 text-xs font-medium text-navy/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden />
            {t("badge")}
          </span>

          <h1 className="animate-fade-up mt-6 text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-5xl lg:text-[3.9rem]" style={{ animationDelay: "60ms" }}>
            {t("titleLead")}{" "}
            <span className="text-emerald-ink">{t("titleAccent")}</span>
          </h1>

          <p className="animate-fade-up mt-5 text-lg leading-relaxed text-navy/70" style={{ animationDelay: "120ms" }}>
            {t("subtitle")}
          </p>

          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "180ms" }}>
            <Link
              href="/dashboard"
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-ink px-6 font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy/15 bg-white px-6 font-medium text-navy transition-colors hover:border-navy/30"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          <ul className="animate-fade-up mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-navy/10 pt-6" style={{ animationDelay: "240ms" }}>
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-navy/70">
                <Check className="h-4 w-4 shrink-0 text-emerald-ink" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Product surface */}
        <div className="animate-fade-up lg:justify-self-end" style={{ animationDelay: "200ms" }}>
          <ProductMock />
        </div>
      </div>
    </section>
  );
}
