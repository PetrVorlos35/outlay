// Loading skeletons mirroring each screen's real layout so swapping in async
// data causes no layout shift. Presentational only.

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-navy/[0.07] ${className}`} />
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3.5 w-12" />
    </div>
  );
}

function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white">
      <div className="border-b border-navy/[0.07] px-5 py-4 sm:px-6">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="px-2 py-2 sm:px-3">
        {Array.from({ length: rows }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <>
      {/* Hero band */}
      <div className="grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-white p-6 sm:p-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-11 w-48" />
          <Skeleton className="mt-3 h-3.5 w-32" />
          <div className="mt-7 flex h-[88px] items-end gap-1.5">
            {[60, 72, 55, 80, 68, 90, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-sm bg-navy/[0.07]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex-1 px-6 py-4 sm:px-7 ${i < 2 ? "border-b border-navy/[0.07]" : ""}`}
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2.5 h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Lists */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <PanelSkeleton rows={6} />
        <PanelSkeleton rows={3} />
      </div>
    </>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-navy/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Skeleton className="h-10 w-full rounded-xl sm:w-72" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-navy/[0.06] px-4 py-3 first:border-t-0 sm:px-5"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="hidden h-3.5 w-20 md:block" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white px-5 py-4 sm:px-6 sm:py-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <Skeleton className="h-4 w-40" />
          <div className="mt-6 flex h-[180px] items-end gap-1.5">
            {[40, 60, 50, 75, 65, 85, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-sm bg-navy/[0.07]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
          <Skeleton className="h-4 w-28" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
