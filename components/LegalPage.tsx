import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Wordmark from "@/components/Wordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LEGAL_UPDATED, type LegalDoc } from "@/lib/legal";

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = useTranslations("legal");
  const locale = useLocale();
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(LEGAL_UPDATED),
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-navy/5 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <Link href="/" aria-label="outlay home">
            <Wordmark />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-navy/60 transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-navy/50">{t("updated", { date: updated })}</p>
        <p className="mt-6 text-[17px] leading-relaxed text-navy/70">{doc.intro}</p>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold tracking-tight text-navy">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-relaxed text-navy/70 text-pretty"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
