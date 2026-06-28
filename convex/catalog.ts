import { internalMutation, query } from "./_generated/server";
import { CATALOG, POPULAR_NAMES, czkPrice } from "../lib/catalog";

// The reference catalog. It's public, non-sensitive data shared by all users,
// so `list` needs no auth. Edit rows directly in the dashboard, or re-run
// `npx convex run catalog:seed` to refresh prices/services from lib/catalog.ts.

/** All catalog entries (USD baseline prices); the client converts on prefill. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("catalogEntries").take(1000);
    return docs.map((d) => ({
      name: d.name,
      domain: d.domain,
      color: d.color,
      price: d.price,
      priceCzk: d.priceCzk,
      cycle: d.cycle,
      category: d.category,
      popular: d.popular ?? false,
    }));
  },
});

/**
 * Idempotent seed/refresh from the bundled `CATALOG`. Upserts by name so it can
 * be re-run after editing lib/catalog.ts without creating duplicates. Run with
 * `npx convex run catalog:seed`.
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    for (const entry of CATALOG) {
      const fields = {
        name: entry.name,
        domain: entry.domain,
        color: entry.color,
        price: entry.price,
        priceCzk: czkPrice(entry),
        cycle: entry.cycle,
        category: entry.category,
        popular: POPULAR_NAMES.has(entry.name),
      };
      const existing = await ctx.db
        .query("catalogEntries")
        .withIndex("by_name", (q) => q.eq("name", entry.name))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, fields);
        updated++;
      } else {
        await ctx.db.insert("catalogEntries", fields);
        inserted++;
      }
    }
    return { inserted, updated, total: CATALOG.length };
  },
});
