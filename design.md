# Design — Step 1 UWorld Tracker

Locked design system. Every view reads this before changing. Amend this file; do not override per page.

## Genre
modern-minimal. Tone: focused.

## Macrostructure family
- App pages: Workbench. Side rail (N3) on md+, bottom bar below. Flat ruled sections; cards only for working surfaces (lists, forms).
- Sign-in: left-aligned statement beside a placeholder readout. No centered card.

## Theme — Cobalt
Tokens live in `tokens.css` (light + graphite dark): paper, surface, sunken, rule, rule-strong, ink, ink-2, ink-3, accent, accent-ink, accent-soft, good, bad, warn (+ soft). Accent ≤ 5% of a viewport.

## Typography
- Display: Space Grotesk 600, roman. Body: Inter. Mono: JetBrains Mono (data meta only).
- Sentence-case labels. No uppercase eyebrows on form fields.

## Motion
- `--ease-out` only. Animate transform and opacity; never width/height. Reduced motion collapses to ~0ms.

## Microinteractions stance
- Silent success. No celebratory toasts. Targets ≥ 44px below md, ≥ 36px at md+.

## CTA voice
- Primary: filled accent, 6px radius. Secondary: hairline outline. Ghost for tertiary.

## Must share
Wordmark + bar mark, Cobalt accent, font pairing, radii tokens (`pip`, `seg`, `ctl`, `card`), `shadow-pop`.

## Per-page allowances
No enrichment on app pages. Data is real or `—`; never invented.
