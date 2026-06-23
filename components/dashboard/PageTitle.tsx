"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab title for a dashboard route. Dashboard pages are client
 * components and can't export Next metadata, so we set document.title directly.
 */
export default function PageTitle({ section }: { section: string }) {
  useEffect(() => {
    document.title = `${section} — outlay`;
  }, [section]);
  return null;
}
