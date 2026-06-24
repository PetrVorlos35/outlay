# Product

## Register

product

> Primary surface is the **product** (the dashboard app). The marketing landing
> (Hero, Features, Pricing, HowItWorks) is an equally-valued **brand** surface —
> override the register per task when working on those pages.

## Users

People tracking their own recurring subscriptions — streaming, software, music,
cloud, fitness, news. Mostly individuals managing personal money, not finance
professionals. They open Outlay to answer three questions fast: *what am I
paying, what renews next, where is money quietly leaking.* Context is a quick
check-in (often on a phone), not a long analytics session. The audience is
bilingual: the product ships in **Czech and English** with full parity.

## Product Purpose

Outlay turns scattered, easy-to-forget recurring charges into one calm, honest
picture: total monthly/annual spend, what renews when, price hikes, and quick
inline actions (mark a charge paid → roll the renewal forward; cancel → pause
it). Success is the user feeling *in control* of their subscriptions — catching
a forgotten renewal or an unwanted price increase before it costs them, without
the app ever feeling like a chore or a source of stress.

## Brand Personality

Calm, precise, trustworthy. Quiet competence over hype. The voice is plain and
honest — it states facts and money clearly (exact figures, monospace numerals)
and never manufactures urgency or upsells. Think of a well-made financial
instrument that respects the user's attention: confident enough not to shout.
Three words: **calm, exact, dependable.**

## Anti-references

Avoid all four (user flagged each explicitly):

- **Generic SaaS template** — purple/blue gradients, the hero-metric template,
  endless identical icon+heading cards, gradient text. The default AI look.
- **Corporate fintech / bank** — cold navy-and-gold, formal, heavy, insurance
  -company impersonal and dull.
- **Crypto / hype dashboard** — neon charts, blinking numbers, dark-mode-
  because-cool, animation overload, "degen" energy.
- **Cutesy toy** — over-playful, rounded mascots, childish colors. Undermines
  trust when money is involved.

## Design Principles

1. **Numbers you can trust at a glance.** Clarity and precision beat decoration.
   Every figure is legible and exact (tabular monospace); nothing important is
   ever ambiguous or buried.
2. **Calm over alarm.** Financial anxiety is the enemy. Surface what genuinely
   needs action (urgent renewals, price hikes, due charges) without inventing
   urgency or red-alerting routine state.
3. **Action where the information is.** Let users act in context — mark paid,
   cancel, edit — right on the subscription, not three menus deep.
4. **Bilingual by construction.** cs/en parity is a constraint, not a feature.
   Copy must read naturally in both, survive ICU plurals and latin-ext glyphs,
   and never assume English string lengths.
5. **Earn trust like a tool, not a pitch.** The product proves itself by working
   well and looking honest — restraint, real data, no marketing gloss inside the
   app.

## Accessibility & Inclusion

Target **WCAG 2.1 AA, with extra care**:

- **Never rely on color alone.** Status and urgency carry an icon/label/shape in
  addition to color (color-blind safe) — e.g. status pills use dot + text, price
  hikes use an icon, not just amber.
- **Contrast:** body text ≥ 4.5:1, large/bold ≥ 3:1, placeholders held to body
  contrast. Watch muted navy-on-paper combinations.
- **Large, clear targets** and visible keyboard focus rings on every interactive
  element (rows, inline actions, drawer controls).
- **Reduced motion** is honored: every animation has a `prefers-reduced-motion`
  off-switch (already wired in `app/globals.css`).
