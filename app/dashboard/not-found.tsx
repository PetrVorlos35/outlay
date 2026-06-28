import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Compass } from "lucide-react";

// 404 for the product surface. Rendered inside the dashboard layout (sidebar +
// chrome) so a missing page still feels like part of the app. Reached when the
// dashboard [...notfound] catch-all calls notFound() for an unmatched route.
export default function DashboardNotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald-ink">
        <Compass className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <p className="mt-6 font-mono text-sm font-medium tracking-[0.3em] text-navy/40 tabular-nums">
        {t("code")}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy text-balance">
        {t("dashTitle")}
      </h1>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-navy/60">
        {t("dashBody")}
      </p>
      <Link
        href="/dashboard"
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-ink px-6 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("dashBack")}
      </Link>
    </div>
  );
}
