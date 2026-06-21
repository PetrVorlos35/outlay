import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("how");

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section id="how" className="border-y border-navy/10 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {t("heading")}
          </h2>
        </div>

        <ol className="relative mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {/* Connecting hairline */}
          <div
            className="absolute left-0 right-0 top-[18px] hidden h-px bg-navy/10 sm:block"
            aria-hidden
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-ink/30 bg-emerald-ink font-mono text-sm font-medium text-paper">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-navy/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
