---
owner: docs/spec/design-system.md
authority: canonical
status: active
answers: ["What does the design system own?", "How does client identity differ from the foundation?"]
---
# Design system

The implemented foundation owns role-based tokens, typography and spacing scales, layout widths, responsive rules, surfaces, focus treatment, buttons, section rhythm, borders, one restrained elevation, and motion rules. `DESIGN.md` is the portable design contract; `src/styles/tokens.css` is its runtime projection. `.impeccable/design.json` is a derived tool sidecar. Forms, media treatment, and further controls remain planned until their components exist.

The reference direction is The Composed Foundation: Typesetter's Galley supplies measure and rhythm, Civic Wayfinding supplies action clarity, Build Instructions supplies component legibility, and Linked Fold supplies responsive coordination. These are system disciplines, not literal client motifs.

Tokens describe roles such as `--color-brand`, never incidental appearances such as `--blue`. The base is mobile-first, content-driven, accessible, restrained, and neutral enough to accept substantially different client identities. System fonts are the default; client fonts should be licensed and self-hosted when practical.

Avoid generic AI-site conventions, ornamental gradients, gratuitous glass effects, meaningless cards, fabricated metrics, and motion without a user purpose. Visual uniqueness should primarily come from tokens, typography, real imagery, spacing, composition, and content.
