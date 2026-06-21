import Link from "next/link";
import { useTranslations } from "next-intl";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const t = useTranslations("nav");
  const c = useTranslations("cta");

  const nav = [
    { label: t("features"), href: "#features" },
    { label: t("how"), href: "#how" },
    { label: t("pricing"), href: "#pricing" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-navy/5 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#top" aria-label="outlay home">
            <Wordmark />
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-navy/60 transition-colors hover:text-navy"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Link
              href="/signin"
              className="hidden h-9 cursor-pointer items-center rounded-lg px-3 text-sm font-medium text-navy/70 transition-colors hover:text-navy sm:inline-flex"
            >
              {t("signIn")}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-4 text-sm font-medium text-paper transition-colors hover:bg-navy/90"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />

        {/* Dark CTA band — used once, as a deliberate accent */}
        <section className="bg-navy">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
                {c("heading")}
              </h2>
              <p className="mt-4 text-lg text-paper/60">{c("body")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-ink px-6 font-medium text-paper transition-colors hover:bg-emerald-ink/90"
                >
                  {c("primary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-paper/20 px-6 font-medium text-paper transition-colors hover:border-paper/40"
                >
                  {c("secondary")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
