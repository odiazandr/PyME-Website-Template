---
name: PyME Website Foundation
description: The Composed Foundation — a precise, adaptable visual system for client-owned Mexican PyME websites.
colors:
  paper: "#f4f3ee"
  surface: "#ffffff"
  surface-muted: "#e9ebe7"
  ink: "#172129"
  ink-muted: "#55616a"
  wayfinding-teal: "#165f5b"
  wayfinding-teal-deep: "#104b48"
  proof-vermilion: "#b54b2e"
  proof-vermilion-soft: "#f3e3db"
  rule: "#c9cfcc"
  rule-strong: "#8c9794"
  focus-vermilion: "#b54b2e"
  selection-mint: "#d8e8e5"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2.75rem, 1.8rem + 4vw, 5.75rem)"
    fontWeight: 680
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.875rem, 1.4rem + 1.9vw, 3rem)"
    fontWeight: 680
    lineHeight: 1.16
    letterSpacing: "-0.03em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.375rem, 1.15rem + 0.9vw, 1.875rem)"
    fontWeight: 680
    lineHeight: 1.16
    letterSpacing: "-0.03em"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "0.08em"
  action:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "0.25rem"
  md: "0.75rem"
  lg: "1rem"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.wayfinding-teal}"
    textColor: "{colors.surface}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "2.875rem"
  button-primary-hover:
    backgroundColor: "{colors.wayfinding-teal-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
    height: "2.875rem"
  card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "1.5rem 0"
---

# Design System: PyME Website Foundation

## Overview

**Creative North Star: "The Composed Foundation"**

Typesetter's Galley is the primary visual language: the foundation reads as a precisely set proof sheet where measure, alignment, and reading order are visible. Bright paper, graphite rules, and a restrained blue-green action ink keep the reference premium and calm while leaving client identity room to change. Civic Wayfinding supplies action clarity; Build Instructions supplies component legibility; Linked Fold supplies responsive coordination.

The system is intentionally operational rather than ornamental. A ruled paper field gives structure, the asymmetric proof layout gives the thesis room to breathe, and the narrow register makes implementation state inspectable without becoming a dashboard. Controls are crisp and tactile; cards are open, ruled records rather than floating tiles. Mobile preserves the same relationships by moving the register beneath the primary measure instead of compressing the desktop composition.

**Key Characteristics:**
- Proof-stock canvas with a subtle four-rem ruling.
- Ink-first typography with a narrow annotation rail.
- Teal actions and vermilion verification accents used semantically.
- Square controls, crisp rules, generous reading space, and responsive relationship preservation.

## Colors

The palette is paper, ink, mineral teal, and proof vermilion: low-noise neutrals carry reading while accents mark action and verification.

### Primary
- **Wayfinding Teal** (`{colors.wayfinding-teal}`): Primary action color for links, calls to action, skip navigation, and brand-toned sections.
- **Wayfinding Teal Deep** (`{colors.wayfinding-teal-deep}`): Hover state for primary actions and text-link emphasis.

### Secondary
- **Proof Vermilion** (`{colors.proof-vermilion}`): Verification and status accent, used for register labels and focus treatment.
- **Proof Vermilion Soft** (`{colors.proof-vermilion-soft}`): Reserved soft wash for future accent surfaces.

### Neutral
- **Proof Paper** (`{colors.paper}`): Default page canvas and ruled field.
- **Surface White** (`{colors.surface}`): Raised register and surface sections.
- **Muted Mineral** (`{colors.surface-muted}`): Quiet supporting surface when needed.
- **Ink** (`{colors.ink}`): Primary text, headings, footer, and structural contrast.
- **Muted Ink** (`{colors.ink-muted}`): Supporting copy, lede text, and secondary labels.
- **Rule** (`{colors.rule}`): Light dividers and the background ruling.
- **Strong Rule** (`{colors.rule-strong}`): Header, card, and register boundaries.
- **Selection Mint** (`{colors.selection-mint}`): Text-selection feedback.

### Named Rules
**The Proof-Ink Rule.** Use accent color to identify action or verification; do not turn the entire page into a colored surface.

## Typography

**Display Font:** system-ui (with -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
**Body Font:** the same system sans stack
**Label Font:** the same system sans stack with tracked uppercase treatment

**Character:** A single sturdy sans family makes the foundation dependable and portable. Oversized, tightly set display type creates the galley voice; body copy remains open and calm, while labels behave like compositor annotations.

### Hierarchy
- **Display** (680, `clamp(2.75rem, 1.8rem + 4vw, 5.75rem)`, 1.02): Page thesis and identity; headings are capped at 12ch.
- **Headline** (680, `clamp(1.875rem, 1.4rem + 1.9vw, 3rem)`, 1.16): Section titles and primary explanatory statements.
- **Title** (680, `clamp(1.375rem, 1.15rem + 0.9vw, 1.875rem)`, 1.16): Component and card titles.
- **Body** (400, `1rem`, 1.65): Reading copy, with paragraphs and lists capped at 70ch.
- **Label** (750, `0.75rem`, 0.08em, uppercase): Register metadata, release markers, and compact system annotations.
- **Action** (700, `0.875rem`, 1.2): Direct, sentence-case button labels.

### Named Rules
**The Measure Rule.** Let display and body text retain their intentional measures; do not flatten every section into a centered, equal-width column.

## Layout

The page uses a fluid centered container: the content width is `min(100% - 2 × page gutter, 78rem)`, with a gutter of `clamp(1rem, 3vw, 2.5rem)`. Small and medium containers are `42rem` and `64rem`. Sections use generous vertical padding, `clamp(4rem, 9vw, 6rem)`, with a compact flow rhythm built from the spacing scale.

The first viewport is an asymmetric proof field. At `48rem` and wider, the primary measure occupies a flexible 2fr column and the register a minimum 17rem / 0.85fr rail, with the register offset downward by 2rem. Principles become three equal columns and data rows gain a label/value split. Below that threshold, the same content becomes one flow: thesis, actions, then register. This is the Linked Fold rule in practice—relationships move together rather than isolated elements merely shrinking.

## Elevation & Depth

Depth is mostly tonal and typographic: paper against white surface, rules, and spacing establish hierarchy. The implementation uses one restrained raised treatment for the status register, keeping the shadow ambient rather than decorative.

### Shadow Vocabulary
- **Raised register** (`0 0.75rem 2rem rgb(23 33 41 / 0.1)`): Lift the implementation register above the proof-stock field.

### Named Rules
**The One-Lift Rule.** Keep surfaces flat by default; reserve the single raised treatment for the register that needs clear separation from the ruled field.

## Shapes

The form language is crisp and typographic. Controls use a gently softened square corner (`0.25rem`); the wider radius steps (`0.75rem`, `1rem`) are available for client-specific extensions, not a default pill vocabulary. Borders are one-pixel rules, cards have an open top rule instead of a surrounding box, and clipping is not used as decoration.

## Components

### Buttons
- **Shape:** Square-edged with a slight softening (`0.25rem`), minimum height `2.875rem`.
- **Primary:** Teal background with white text; `0.75rem 1.25rem` padding and bold, sentence-case action text.
- **Hover / Focus:** Deep teal hover with a one-pixel upward translation; global vermilion focus ring is `0.1875rem` with `0.1875rem` offset. Reduced motion removes translation, transitions, and smooth anchor scrolling.
- **Secondary:** Transparent ink button with strong-rule border; hover fills white and strengthens the border. Brand-toned sections supply contextual contrast tokens so default and hover text remain legible.

### Forms and Privacy Content
Forms are compact, single-column reading flows capped at the small container. Each field keeps its label above the control, uses a one-pixel strong-rule border, surface-white fill, and the shared gently softened square corner. Supporting hints stay muted and directly precede the control. Privacy guidance is an inline notice rather than a modal or decorative card: use muted small text with a vermilion accent rule at the start edge, and keep the approved privacy link in the notice's reading flow. Submit actions use the primary teal button treatment and remain aligned to the form's start edge. Legal-content pages use the shared page hero and a small, surface-toned reading column; placeholder or review-pending legal copy is visibly framed as non-production content and the route remains non-indexable until approved.

### Cards / Containers
- **Corner Style:** Cards remain square/open; no outer radius.
- **Background:** Transparent on paper or white section surfaces.
- **Shadow Strategy:** No card shadow; use the top strong rule and spacing.
- **Border:** One-pixel strong rule at the block start.
- **Internal Padding:** `1.5rem` block padding with `1.25rem` internal flow gap.

### Navigation
- **Style:** Compact masthead with the client wordmark on the left and a wrapping primary route list on the right at wide widths, separated from content by a strong rule.
- **Typography:** Wordmark is small and heavy; release is tracked uppercase, muted, and tabular.
- **Active state:** Current route and hover use ink plus a vermilion underline with a deliberate offset; route links remain text-first rather than button-like.
- **Mobile treatment:** Stack the wordmark and route list while allowing links to wrap; do not collapse identity into a menu icon without an actual navigation requirement.

### Page Hero
The reusable page hero is a centered, viewport-aware proof opening: it uses a minimum height capped at `38rem` (accounting for the masthead), aligns content to the lower edge, and preserves an asymmetric thesis/copy relationship. At `48rem` and wider, the title uses a flexible `1.45fr` measure beside an `18rem` minimum action/copy rail with a generous gap; below it, the same content flows vertically. Optional primary and secondary actions stay clustered beneath the supporting copy.

### Services and Locations
Repeated business records use open, ruled articles rather than floating cards. Services become three equal columns at `48rem` and wider; locations become two columns at the same threshold. Each location keeps address text muted and places the directions link after the address, preserving scan order. Both grids collapse to a single flow on narrow screens.

### Brand CTA Sections
Brand-toned sections use Wayfinding Teal as a semantic contrast surface. Text and muted copy switch to the contrast token, and secondary controls invert to contrast-on-teal with a contrast border and teal hover surface. The default section rhythm remains intact; color carries the action moment without adding ornament.

### Footer
The footer is a deliberate dark ink closure with contrast text: business identity/description and direct contact occupy a `1.5fr / 1fr` split at `48rem` and wider, then stack on mobile. A full-width metadata row follows after generous spacing and a translucent white rule; privacy, template state, and reference status remain visibly separate from the contact block.

### Status Register
The signature component is a raised, ruled definition list: a vermilion uppercase title followed by label/value rows. It is a clarity device for implementation state, not a generic card. On wide screens it anchors the composing rail; on mobile it follows the actions at full available width.

## Do's and Don'ts

### Do:
- **Do** compose pages around a clear primary measure and a supporting rail when the content warrants it.
- **Do** use rules, spacing, and type measure to make hierarchy legible before adding decoration.
- **Do** use teal for actions and vermilion for verification/focus so color carries meaning.
- **Do** preserve connected layout relationships across breakpoints and honor reduced-motion preferences.

### Don't:
- **Don't** turn the neutral foundation into an administrative dashboard or a dense grid of status widgets.
- **Don't** use pill controls, gratuitous rounded cards, or ornamental hatching as the default client language.
- **Don't** use shadows on every surface; the register is the deliberate exception.
- **Don't** invent client claims, imagery, or identity inside the reference foundation.
