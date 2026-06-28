"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CATALOG, POPULAR, type CatalogEntry } from "@/lib/catalog";

/**
 * The service catalog, sourced from Convex when available and falling back to
 * the bundled list while the query is in flight or the table is unseeded — so
 * the add form is always usable instantly. `popular` drives the quick-adds.
 */
export function useCatalog(): { entries: CatalogEntry[]; popular: CatalogEntry[] } {
  const remote = useQuery(api.catalog.list);
  return useMemo(() => {
    if (!remote || remote.length === 0) {
      return { entries: CATALOG, popular: POPULAR };
    }
    const strip = ({ name, domain, color, price, priceCzk, cycle, category }: CatalogEntry & { popular: boolean }): CatalogEntry =>
      ({ name, domain, color, price, priceCzk, cycle, category });
    const entries = remote.map(strip);
    const popular = remote.filter((e) => e.popular).map(strip);
    return { entries, popular: popular.length ? popular : POPULAR };
  }, [remote]);
}
