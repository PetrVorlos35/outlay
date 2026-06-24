"use client";

import { Info } from "lucide-react";

/**
 * Small "?" affordance with an accessible tooltip on hover and keyboard focus.
 * Explains a piece of domain jargon (e.g. monthly-normalized amounts) at the
 * point of use, without cluttering the default view.
 */
export default function InfoHint({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="flex h-5 w-5 cursor-help items-center justify-center rounded-full text-navy/35 transition-colors hover:text-navy/70 focus:outline-none focus-visible:text-navy/70 focus-visible:ring-2 focus-visible:ring-emerald-ink/30"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-navy px-3 py-2 text-xs font-medium leading-relaxed text-paper opacity-0 shadow-[0_8px_24px_-12px_rgba(11,18,32,0.5)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        {text}
      </span>
    </span>
  );
}
