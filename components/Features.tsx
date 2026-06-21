import { useTranslations } from "next-intl";
import { Eye, BellRing, TrendingUp, PieChart } from "lucide-react";

export default function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {t("heading")}
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Large: see everything */}
        <article className="group flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 sm:col-span-2">
          <div className="max-w-md">
            <Icon icon={Eye} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
              {t("see.title")}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
              {t("see.body")}
            </p>
          </div>
          {/* Mini stacked list visual */}
          <div className="mt-6 space-y-2">
            {[
              { n: "Netflix", p: "15.49", c: "bg-[#E50914]" },
              { n: "Spotify", p: "10.99", c: "bg-[#1DB954]" },
              { n: "Notion", p: "8.00", c: "bg-navy" },
            ].map((r) => (
              <div
                key={r.n}
                className="flex items-center gap-3 rounded-lg border border-navy/[0.07] bg-paper px-3 py-2"
              >
                <span className={`h-5 w-5 rounded ${r.c}`} aria-hidden />
                <span className="flex-1 text-sm font-medium text-navy">{r.n}</span>
                <span className="font-mono text-sm text-navy/70">${r.p}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Notify */}
        <article className="rounded-2xl border border-navy/10 bg-white p-6">
          <Icon icon={BellRing} />
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
            {t("notify.title")}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
            {t("notify.body")}
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-amber/30 bg-amber/[0.07] px-3 py-2.5">
            <BellRing className="h-4 w-4 shrink-0 text-amber-ink" />
            <p className="text-xs text-navy/70">
              {t("notify.alert", { name: "Netflix", days: 2, price: "$15.49" })}
            </p>
          </div>
        </article>

        {/* Price hikes */}
        <article className="rounded-2xl border border-navy/10 bg-white p-6">
          <Icon icon={TrendingUp} />
          <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
            {t("hikes.title")}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
            {t("hikes.body")}
          </p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="font-mono text-sm text-navy/40 line-through">
              $9.99
            </span>
            <span className="font-mono text-lg font-semibold text-navy">
              $12.99
            </span>
            <span className="rounded-full bg-amber/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-ink">
              +30%
            </span>
          </div>
        </article>

        {/* Spend total - wide */}
        <article className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 sm:col-span-2">
          <div className="max-w-md">
            <Icon icon={PieChart} />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
              {t("spend.title")}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
              {t("spend.body")}
            </p>
          </div>
          {/* Mini bar chart */}
          <div className="mt-6 flex h-20 items-end gap-2" aria-hidden>
            {[48, 55, 44, 63, 58, 70, 66, 78, 72, 84, 80, 92].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${
                  i === 11 ? "bg-emerald" : "bg-navy/10"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function Icon({ icon: I }: { icon: typeof Eye }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-navy/10 bg-paper text-emerald-ink">
      <I className="h-5 w-5" strokeWidth={1.75} />
    </span>
  );
}
