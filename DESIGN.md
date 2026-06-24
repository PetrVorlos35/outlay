---
name: Outlay
description: Calm, exact subscription tracking — every recurring charge, always visible.
colors:
  ink-navy: "#0b1220"
  paper: "#fafaf9"
  card-white: "#ffffff"
  signal-emerald: "#10b981"
  ledger-green: "#047857"
  alert-amber: "#f59e0b"
  caution-amber: "#b45309"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.9rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
  numeral:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ledger-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.ledger-green}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "40px"
  input:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.xl}"
    padding: "0 14px"
    height: "44px"
  panel:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  status-pill:
    backgroundColor: "{colors.signal-emerald}"
    textColor: "{colors.ledger-green}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Outlay

## 1. Overview

**Creative North Star: "The Quiet Ledger"**

Outlay is a financial instrument that respects your attention. Picture a clean
accountant's ledger on a bright desk: hairline rules, exact figures in a
monospace column, generous margins, and not one decorative flourish that doesn't
help you read a number faster. The interface is built from a near-white **Paper**
field, **Card White** surfaces separated by 1px **Ink Navy** hairlines, and a
single working accent — **Ledger Green** — reserved for the things you can act on.
Money is always set in tabular monospace so columns align and figures never
shift under the eye.

The system's job is *calm certainty*. It surfaces what genuinely needs action —
an imminent renewal, a price hike, a charge due today — with restraint, never
manufactured urgency. Amber means "look here," not "panic." Green means "this is
yours / this is done." Everything else recedes to muted navy. The density is
moderate-to-airy: a quick phone check-in should answer "what am I paying / what's
next / where's money leaking" in seconds, in Czech or English with equal grace.

This system explicitly rejects four looks: the **generic SaaS template**
(purple-blue gradients, the hero-metric block, endless identical icon+heading
cards, gradient text); **corporate fintech** (cold navy-and-gold, heavy, dull,
insurance-company impersonal); the **crypto/hype dashboard** (neon charts,
blinking numbers, dark-mode-because-cool, animation overload); and the **cutesy
toy** (rounded mascots, childish colors). Trust is earned by working well and
looking honest, not by decoration.

**Key Characteristics:**
- Paper field + white surfaces + 1px navy hairlines; flat by default.
- One working accent (Ledger Green); amber strictly for attention.
- All money in tabular monospace numerals.
- Restraint over alarm; color never the sole signal.
- Bilingual (cs/en) by construction — copy and layout survive both.

## 2. Colors

A near-monochrome navy-on-paper field with one green accent and one amber
attention signal. Restrained color strategy: the accent touches well under 10% of
any screen.

### Primary
- **Ink Navy** (`#0b1220`): The primary text color and the darkest structural
  tone. Used full-strength for headings and key figures; at reduced opacity
  (`/70` body, `/55` muted, `/10`–`/15` borders) for the entire neutral ramp.
  Also the solid fill of the auth panel and dark surfaces.
- **Ledger Green** (`#047857`): The one working accent. Primary button fills,
  active links, the "paid / yours / confirmed" signal, accent headline word.
  White text passes AA on it. This is the *only* color a user is invited to act
  on, which is exactly why it's rare.

### Secondary
- **Signal Emerald** (`#10b981`): The bright sibling of Ledger Green, used for
  **fills and decoration only** — status dots, the live pulse mark, chip
  backgrounds at low opacity. Never for text on light (fails contrast).
- **Alert Amber** (`#f59e0b`): Attention, not error. Renewal-urgency dots, the
  price-hike marker, status fills. Fills and dots only.
- **Caution Amber** (`#b45309`): The accessible amber for *text* on light — the
  "overdue / renews soon / price up" labels. Passes AA on Paper and white.

### Neutral
- **Paper** (`#fafaf9`): The body background. A true near-white at near-zero
  chroma (identity token — preserved, not a warm "cream"). The calm field
  everything sits on.
- **Card White** (`#ffffff`): Raised surfaces — panels, table, drawer, inputs,
  chips. The half-step of contrast above Paper that defines a surface without a
  shadow.
- **Ink Navy alphas**: `navy/70` body text, `navy/55` muted/captions, `navy/45`
  hints, `navy/10`–`/15` borders and dividers, `navy/[0.03]` hover wash. The
  whole gray ramp is Ink Navy at opacity — never a separate gray hue.

### Named Rules
**The One Green Rule.** Ledger/Signal green marks only what is *actionable or
yours* (primary actions, paid state, active status). If green appears on
something inert, it's wrong. Its scarcity is the signal.

**The Amber-Is-Attention Rule.** Amber never means "error" or "danger" — it means
"look here soon." Errors are red (`#dc2626`), reserved for destructive confirm
and validation. Don't blur the two.

**The Navy-Opacity Rule.** Every gray is Ink Navy at an alpha, never a sampled
neutral gray. This keeps the whole UI on one cool hue and stops the washed-out
"gray text on tinted white" failure.

## 3. Typography

**Display / Body Font:** Geist (with system-ui, sans-serif)
**Numeral / Label Font:** Geist Mono (with ui-monospace, monospace)

**Character:** One geometric-humanist sans (Geist) in multiple weights carries
all prose; its monospace sibling (Geist Mono) carries every number. The pairing
is same-family, so it never clashes — the contrast axis is *proportional vs.
tabular*, which is exactly the financial story: words flow, money aligns. Both
load `latin` + `latin-ext` so Czech diacritics render natively.

### Hierarchy
- **Display** (600, `clamp(2.25rem, 5vw, 3.9rem)`, line-height 1.05,
  `-0.025em`): Hero headline only. `text-wrap: balance`. The one place the system
  raises its voice — and it stays under 4rem, never shouting.
- **Headline** (600, `clamp(1.5rem, 3vw, 2rem)`, 1.15, `-0.02em`): Page titles
  and section heads inside the app and landing sections.
- **Title** (600, `1.125rem`, 1.3, `-0.01em`): Panel/card/drawer titles, the
  "next renewal" service name.
- **Body** (400, `0.875rem`–`1rem`, 1.6): Default prose, set in Ink Navy at
  `/70`. Cap measure at 65–75ch in long-form (legal pages).
- **Label** (500, `0.75rem`, `+0.04em`, often uppercase): Stat captions and
  column headers inside the dashboard ("MONTHLY SPEND", "ACTIVE"). Functional
  table/stat labels — *not* decorative section eyebrows.
- **Numeral** (Geist Mono, 500, tabular-nums): Every monetary figure, count, and
  date-driven number. Always `tabular-nums` so columns don't jitter.

### Named Rules
**The Money-Is-Mono Rule.** Every price, total, count, and percentage is set in
Geist Mono with `tabular-nums`. Prose is never mono; numbers are never
proportional. No exceptions — this is the brand's tell.

**The No-Eyebrow Rule.** The small uppercase Label style is permitted only as a
functional caption on a stat or table column. It is forbidden as a section
eyebrow ("FEATURES", "PRICING") above headings — that's the AI-slop scaffold.

## 4. Elevation

Flat by default. Depth comes from the **Paper → Card White** tonal step and 1px
Ink-Navy hairlines, not from shadows. Shadows appear only on truly floating
layers (the slide-in drawer, dropdown suggestion lists, the dark auth panel),
and even then they are soft, wide, and navy-tinted — a long low diffusion, never
a hard drop. A faint 56px hairline grid (`bg-grid`, navy at ~4.5% alpha) adds
texture to the hero and auth surfaces without a single gradient.

### Shadow Vocabulary
- **Float-soft** (`box-shadow: 0 8px 24px -12px rgba(11,18,32,0.25)`): Dropdowns,
  popovers, the catalog suggestion list.
- **Drawer** (`box-shadow: 0 0 60px -15px rgba(11,18,32,0.4)`): The right-side
  subscription drawer lifting off the page.
- **Lift** (`box-shadow: 0 1px 2px rgba(11,18,32,0.04), 0 24px 48px -24px rgba(11,18,32,0.18)`):
  The landing product mock floating above the grid.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest, defined by a hairline
and a tonal step. A shadow is a statement that an element *floats above the
page* — only overlays and the hero mock earn one. If a card has a shadow at
rest, delete it.

## 5. Components

### Buttons
- **Shape:** Gently rounded (`rounded-xl`, 12px); pills (`rounded-full`) for
  filter toggles and chips.
- **Primary:** Ledger Green fill, Paper text, 40px tall, `0 20px` padding.
  Hover dims to `/90`; focus shows a 2px Ledger-Green ring offset from the
  surface. Used for the single most important action per view (Add, Save, Paid).
- **Secondary / Ghost:** Card White fill with a `navy/15` hairline (ghost = no
  fill, navy text). Hover deepens the border to `navy/30` or washes
  `navy/[0.05]`. Carries cancel, secondary nav, "Pay later".
- **Destructive:** Red (`#dc2626`) fill, white text, only behind a two-step
  confirm (delete).

### Chips / Toggles
- **Style:** Pill (`rounded-lg`/`full`) inside a `navy/15` bordered track. Active
  segment is solid Ink Navy with Paper text; inactive is `navy/60` text that
  darkens on hover.
- **Status pill:** `rounded-full`, dot + label. Active = `emerald/10` bg +
  Ledger-Green text + Signal-Emerald dot; Paused = `navy/[0.05]` bg + `navy/55`
  text + `navy/30` dot. **Always dot *and* text — never color alone.**

### Cards / Panels
- **Corner Style:** `rounded-2xl` (16px) for panels and the table shell;
  `rounded-xl` for inner tiles.
- **Background:** Card White on Paper.
- **Shadow Strategy:** None at rest (see Elevation). Hairline only.
- **Border:** 1px `navy/10`. Dividers `navy/[0.06]`–`/[0.07]`.
- **Internal Padding:** 20–28px (`p-5`/`p-7`); list rows `px-3 py-2.5`.

### Inputs / Fields
- **Style:** Card White, 1px `navy/15` border, `rounded-xl`, 44px tall.
  Placeholder held to body contrast, not faint gray.
- **Focus:** Border shifts to Ledger Green + a 2px `emerald-ink/30` ring. Calm,
  not glowing.
- **Error:** `red-400` border + `red-400/30` ring, message in `red-600` below.

### Navigation
- Dashboard shell with a side/top nav; active route in Ink Navy, inactive
  `navy/60`, hover to full navy. A `LanguageSwitcher` toggles cs/en. The live
  **PulseMark** (Signal Emerald, `animate-pulse-dot`) sits by the wordmark as the
  only ambient motion.

### Signature: RenewalBadge
The countdown that appears anywhere a renewal is shown. A colored dot + text:
muted (`navy/55` + `navy/25` dot) normally, Caution Amber + Alert-Amber dot when
within `URGENT_DAYS` (3) or overdue. Optionally trails `· {date}`. It is the
clearest expression of the Amber-Is-Attention and never-color-alone rules.

### Signature: DueActions
When a charge is due (today or overdue), two inline buttons appear right on the
subscription: **Paid** (Ledger-Green fill, advances the renewal a cycle) and
**Cancel** (secondary ghost, pauses it). The embodiment of "action where the
information is" — no menu dive to confirm a payment.

## 6. Do's and Don'ts

### Do:
- **Do** set every monetary figure in Geist Mono with `tabular-nums` (the
  Money-Is-Mono Rule).
- **Do** keep Ledger/Signal green for actionable-or-yours only; let its rarity do
  the work (the One Green Rule).
- **Do** build every gray from Ink Navy at an alpha (`navy/70`, `navy/10`), never
  a sampled neutral gray.
- **Do** pair amber with an icon or dot *and* text so meaning never rides on
  color alone (WCAG AA + color-blind care).
- **Do** keep surfaces flat at rest — hairline + tonal step, shadow only for true
  overlays (the Flat-By-Default Rule).
- **Do** test every label and heading in **both Czech and English**; Czech runs
  longer and uses latin-ext diacritics.
- **Do** honor `prefers-reduced-motion` (already wired in `globals.css`).

### Don't:
- **Don't** ship the **generic SaaS template**: no purple-blue gradients, no
  hero-metric block, no endless identical icon+heading card grids.
- **Don't** use **gradient text** (`background-clip: text`) or **glassmorphism**
  as decoration — both are banned.
- **Don't** drift into **corporate fintech**: no cold navy-and-gold, no heavy
  formal "insurance company" weight.
- **Don't** chase the **crypto/hype** look: no neon charts, blinking numbers,
  dark-mode-because-cool, or animation overload.
- **Don't** go **cutesy**: no mascots, rounded childish illustration, or candy
  colors — money demands seriousness.
- **Don't** put a tiny uppercase tracked **eyebrow** ("FEATURES", "PRICING")
  above section headings (the No-Eyebrow Rule).
- **Don't** use a colored `border-left`/`border-right` > 1px as a stripe accent
  on cards or alerts; use a full hairline or a background tint.
- **Don't** let amber read as "error" — errors are red (`#dc2626`) and gated
  behind confirm.
