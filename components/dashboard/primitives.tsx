import { monogram } from "@/lib/format";
import type { Subscription } from "@/lib/subscriptions";

// Readable text color for a brand-tinted tile. Dark brand colors (Notion,
// NYTimes) keep white; light ones would too here, but our seed set is saturated.
function tileTextClass(): string {
  return "text-white";
}

export function Monogram({
  sub,
  size = "md",
}: {
  sub: Pick<Subscription, "name" | "color">;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "h-11 w-11 text-base rounded-xl"
      : size === "sm"
        ? "h-8 w-8 text-xs rounded-lg"
        : "h-9 w-9 text-sm rounded-lg";
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-semibold ${tileTextClass()} ${dim}`}
      style={{ backgroundColor: sub.color }}
      aria-hidden
    >
      {monogram(sub.name)}
    </span>
  );
}

/** White content panel — the dashboard's primary surface unit. */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-navy/10 bg-white ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-navy/[0.07] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold tracking-tight text-navy">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-navy/55">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClassName || "p-5 sm:p-6"}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-[15px] text-navy/60">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald-ink">
        {icon}
      </span>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-navy">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-navy/60">
        {body}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
