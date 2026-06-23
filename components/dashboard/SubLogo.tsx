"use client";

import { useState } from "react";
import type { Subscription } from "@/lib/subscriptions";
import { Monogram } from "./primitives";

type Size = "sm" | "md" | "lg";

const TILE: Record<Size, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-lg",
  lg: "h-11 w-11 rounded-xl",
};

/**
 * A subscription's avatar: the real brand logo when available, otherwise the
 * colored first-letter monogram. Falls back to the monogram if the logo image
 * fails to load (404, offline, blocked), so there's never a broken image.
 */
export default function SubLogo({
  sub,
  size = "md",
}: {
  sub: Pick<Subscription, "name" | "color" | "logo">;
  size?: Size;
}) {
  const [failed, setFailed] = useState(false);

  if (!sub.logo || failed) {
    return <Monogram sub={sub} size={size} />;
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-navy/10 bg-white ${TILE[size]}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sub.logo}
        alt=""
        aria-hidden
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-[62%] w-[62%] object-contain"
      />
    </span>
  );
}
