import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Footer from "@/components/Footer";

// Global 404 for the brand surface. Next renders this for any unmatched URL
// (dashboard misses are routed to app/dashboard/not-found.tsx via the
// [...notfound] catch-all, so they stay inside the product chrome instead).
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-navy/5 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="outlay home">
            <Wordmark />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20">
        <div
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald/10 blur-3xl"
          aria-hidden
        />

        <div className="animate-fade-up relative max-w-md text-center">
          <p className="font-mono text-7xl font-semibold tracking-tight text-navy tabular-nums sm:text-8xl">
            4<span className="text-emerald-ink">0</span>4
          </p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-navy text-balance sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-navy/60">
            {t("body")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 text-sm font-medium text-paper transition-colors hover:bg-navy/90 sm:w-auto"
            >
              {t("home")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-navy/15 px-6 text-sm font-medium text-navy transition-colors hover:border-navy/30 sm:w-auto"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
