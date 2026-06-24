---
target: dashboard
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-24T11-15-26Z
slug: app-dashboard-page-tsx
---
# Dashboard Critique — Outlay

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Mutations are fire-and-forget; success toast fires before the write is confirmed |
| 2 | Match System / Real World | 4 | Plain money/date language, cs/en parity — solid |
| 3 | User Control and Freedom | 2 | No undo on "Paid"/"Cancel"; a misclick silently rolls the renewal forward |
| 4 | Consistency and Standards | 3 | Cohesive system; one smell: interactive buttons nested in a role="button" row |
| 5 | Error Prevention | 3 | Delete is 2-step + input validation, but "Paid" is irreversible with no confirm |
| 6 | Recognition Rather Than Recall | 4 | Labeled nav, catalog autocomplete, visible filters — strong |
| 7 | Flexibility and Efficiency | 3 | Search/sort/filter + inline actions; no keyboard shortcuts or bulk actions |
| 8 | Aesthetic and Minimalist Design | 4 | Restrained, on-brand, no clutter — excellent |
| 9 | Error Recovery | 1 | No failure path: a failed mutation still shows a "success" toast |
| 10 | Help and Documentation | 1 | No tooltips/help; "monthly normalized" math is unexplained |
| **Total** | | **27/40** | **Acceptable (upper edge) — strong surface, weak write-trust** |

## Anti-Patterns Verdict

**Does this look AI-generated? No.** This is a genuine, committed design system.

**LLM assessment:** No slop tells. One working accent (emerald-ink) used sparingly, navy-opacity gray ramp, money in tabular mono, hairline-defined flat surfaces, functional uppercase stat captions (not section eyebrows). Composition varies (hero band, asymmetric two-column lists, stat strip) rather than identical card grids. Motion is restrained and reduced-motion-guarded.

**Deterministic scan:** `detect.mjs` over `app/dashboard` + `components/dashboard` returned **zero findings**. Clean.

**Visual overlays:** Not available — no dev server was running and browser automation wasn't used this pass. Review is source-based; re-run with the app live for pixel-level overlays.

## Overall Impression

The dashboard *looks* like a trustworthy financial instrument — and that's the problem hiding in plain sight: the visual craft writes a check the data and write-path don't yet cash. The spend trend is **synthetic** (`buildSpendHistory`), and every mutation is **optimistic with no failure path** — the toast says "done" whether or not the server agreed. The single biggest opportunity is making writes *honest*: pending → confirmed/failed, with undo. That one change moves this from a pretty dashboard to a tool you trust with money.

## What's Working

1. **A real, defensible visual system.** Navy-on-paper, one green accent, mono money, hairline flatness. It reads calm and exact — exactly the brief. Nothing to redesign here.
2. **Information hierarchy on the overview.** The hero spend band + side stats + "Upcoming / Attention" split answers the three core questions fast, with the month/year toggle as a genuine accelerator.
3. **Accessibility groundwork.** `aria-current`, labeled icon nav, visible focus rings, status conveyed by dot **and** text (color-blind safe), keyboard handlers on rows, reduced-motion alternatives.

## Priority Issues

- **[P1] Writes are optimistic with no failure path.** `void addMutation(...)` and friends never await or catch; the success toast fires from the UI regardless of server outcome. A failed save (offline, server error) tells the user it worked.
  - **Why it matters:** In a money tool, a phantom "saved" is a trust-breaker — the user believes a subscription/payment was recorded when it wasn't.
  - **Fix:** Await mutations, show a pending state, toast success only on resolve, and surface a real error toast with retry on reject.
  - **Suggested command:** `/impeccable harden`

- **[P1] The spend trend is fabricated.** `buildSpendHistory(monthly)` and the ChangePill delta are synthetic, not real history. A confident trend line on invented data contradicts "numbers you can trust."
  - **Why it matters:** The chart is the most authoritative-looking element and it's the least real. Riley (stress tester) will notice a smooth trend with one subscription.
  - **Fix:** Either back it with real per-month history, or visibly mark it as a projection/estimate until real data exists.
  - **Suggested command:** `/impeccable shape` (data model) → `/impeccable harden`

- **[P2] No undo on "Paid" / "Cancel".** Both are one-click and irreversible from the toast; a mis-tap on "Paid" silently advances the renewal a full cycle.
  - **Why it matters:** User Control — the two highest-consequence inline actions have the least safety.
  - **Fix:** Add an **Undo** action to the toast (revert date / un-pause) for a few seconds.
  - **Suggested command:** `/impeccable harden`

- **[P2] Interactive buttons nested inside a clickable row.** The table row is `role="button"` and contains the DueActions `<button>`s (kept working via `stopPropagation`). Valid-ish via JS, but interactive-in-interactive is an ARIA smell for screen readers.
  - **Why it matters:** Sam (screen-reader/keyboard) hits a button inside a button; intent is ambiguous.
  - **Fix:** Make the row a non-interactive container with an explicit "Edit" affordance, or move DueActions out of the row's hit area.
  - **Suggested command:** `/impeccable audit`

- **[P2] Thin first-run experience.** Empty overview/insights show one CTA. A first-timer gets no sample data, import path, or value framing.
  - **Why it matters:** Jordan (first-timer) lands on a blank dashboard with a single button and little reason to invest.
  - **Fix:** A richer empty state — seeded examples, catalog quick-add row, one line on the payoff.
  - **Suggested command:** `/impeccable onboard`

## Persona Red Flags

**Alex (Power User):** No keyboard shortcuts (no ⌘K, no "n" for new). No bulk select / bulk pause — pausing five lapsed services is five separate flows. Sorting and search are good.

**Sam (Accessibility):** Mostly strong (focus rings, aria, color+text). But a `<button>` nested inside a `role="button"` table row is a screen-reader trap, and the native `<input type="date">` is the only renewal-date affordance.

**Riley (Stress Tester):** The synthetic trend renders a confident curve even with one subscription or flat spend. A failed mutation surfaces a success toast — "appears to work but silently fails," the exact pattern Riley hunts.

## Minor Observations

- The category/breakdown bars on Insights are good, but the breakdown bar uses each sub's brand color while the category bar uses emerald-ink — minor inconsistency in what color encodes.
- `formatCurrency` is hardwired to a `$` glyph in the drawer price field while amounts elsewhere are locale-formatted; a EUR/CZK user sees mixed currency cues.
- Toasts auto-dismiss at 3.4s with no manual dismiss affordance on hover.

## Questions to Consider

- What would the overview look like if the trend chart were honest about being an estimate — would it be *more* trustworthy, not less?
- Should "Paid" and "Cancel" feel as reversible as they are consequential (undo), rather than relying on a confirm dialog you'd grow to resent?
- Is there a power-user layer (⌘K, bulk pause) hiding inside this already-clean surface?
