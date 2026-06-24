import Link from "next/link";
import { useTranslations } from "next-intl";
import Wordmark from "@/components/Wordmark";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  const t = useTranslations("footer");

  const columns = [
    {
      heading: t("product"),
      links: [
        { label: t("linkFeatures"), href: "/#features" },
        { label: t("linkHow"), href: "/#how" },
        { label: t("linkPricing"), href: "/#pricing" },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { label: t("linkPrivacy"), href: "/privacy" },
        { label: t("linkTerms"), href: "/terms" },
        { label: t("linkSecurity"), href: "/security" },
      ],
    },
  ];

  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Brand + newsletter */}
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-3 text-sm leading-relaxed text-navy/70">
              {t("tagline")}
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                  {col.heading}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-navy/60 transition-colors hover:text-navy"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-navy/10 pt-6 text-sm text-navy/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {t.rich("copyright", {
              year: new Date().getFullYear(),
              link: (chunks) => (
                <a
                  href="https://vorlos.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy/80 underline-offset-4 transition-colors hover:text-navy hover:underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <p className="text-xs text-navy/60">{t("madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
