---
target: dashboard
total_score: 34
p0_count: 0
p1_count: 0
timestamp: 2026-06-24T15-59-29Z
slug: app-dashboard-page-tsx
---
# Dashboard Critique (re-run) — Outlay

Second pass after the harden + onboard work. Compared against the 27/40 baseline.

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | +1 | Writes await + success/error toasts; no inline button spinner during the in-flight moment |
| 2 | Match System / Real World | 4 | — | Plain money/date language, cs/en parity |
| 3 | User Control and Freedom | 3 | +1 | Undo now on Paid/Cancel via toast; window is time-bound, no global history |
| 4 | Consistency and Standards | 4 | +1 | Row no longer `role="button"` — interactive nesting resolved |
| 5 | Error Prevention | 4 | +1 | Delete confirm + validation + double-submit guards; Paid is undoable rather than gated |
| 6 | Recognition Rather Than Recall | 4 | — | Labeled nav, catalog autocomplete, one-tap quick-adds |
| 7 | Flexibility and Efficiency | 3 | — | Still no keyboard shortcuts / bulk actions |
| 8 | Aesthetic and Minimalist Design | 4 | — | Restrained, on-brand, no clutter |
| 9 | Error Recovery | 3 | +2 | Real error toast, input preserved on fail; toast is generic, no inline retry button |
| 10 | Help and Documentation | 2 | +1 | Onboarding hint + value copy add light guidance; still no contextual help/tooltips |
| **Total** | | **34/40** | **+7** | **Good — write-trust gap closed; help & power-user depth remain** |

## Anti-Patterns Verdict

**AI-generated? No.** `detect.mjs` over `app/dashboard` + `components/dashboard` = **0 findings** (unchanged). The new onboarding and toast work introduced no slop: quick-add chips are real branded affordances, the empty state avoids the hero-metric/identical-card traps, toasts stay on the navy brand surface.

## Overall Impression

The check the visual craft was writing is now cashed. The single biggest baseline gap — optimistic writes with no failure path — is closed: mutations await, success and **error** are both surfaced, and the two highest-consequence inline actions (Paid / Cancel) are **undoable**. The dashboard now behaves like a tool you can trust with money, not just one that looks the part. What's left is depth, not trust: contextual help and a power-user layer.

## What's Working (new since baseline)

1. **Honest, resilient writes.** `runWrite` centralizes feedback in the provider; a failed save says so and keeps the user's input. This is the right architecture, not a patch.
2. **Undo where it matters.** A mis-tapped "Paid" is one click to revert — better than a confirm dialog the user would learn to resent.
3. **First-value onboarding.** The empty state's one-tap popular adds get a new user to a real monthly-spend number immediately, and the spend trend is now labelled an estimate — the authoritative-looking element stopped overstating.
4. **Accessibility cleanup.** The row is no longer an interactive control wrapping interactive buttons; the service name is a real focusable edit trigger.

## Remaining Issues (none blocking)

- **[P2] No real spend history.** The trend is still synthesized (now honestly labelled). Real history needs a schema + monthly snapshot cron. → `/impeccable shape` then `/impeccable harden`.
- **[P3] No power-user layer.** No ⌘K, no "n" to add, no bulk pause/select. Alex still does everything one at a time. → `/impeccable harden` / a dedicated shortcuts pass.
- **[P3] Thin help.** No contextual tooltips (e.g. what "monthly normalized" means). → `/impeccable onboard` (contextual hints) if desired.
- **[P3] In-flight feedback is toast-only.** Buttons disable but show no spinner during the brief await; fine for fast Convex writes, worth a pending style if latency grows.

## Persona Red Flags (revisited)

**Alex (Power User):** Still no shortcuts or bulk actions — the one persona whose core complaint is unaddressed.
**Sam (Accessibility):** Materially better — focusable name trigger, no nested interactive, toasts announced via the `aria-live` region, undo reachable by keyboard.
**Riley (Stress Tester):** A failed mutation now tells the truth (error toast, input kept); the trend is labelled an estimate. The two "looks like it works but lies" patterns are gone.

## Questions to Consider

- Is real spend history worth the backend cost now, or does the honest "estimate" label carry it until there's enough data to matter?
- What's the smallest power-user layer that would satisfy Alex — just ⌘K + "n", or bulk pause too?
