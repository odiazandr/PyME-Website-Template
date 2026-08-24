---
owner: docs/spec/component-system.md
authority: canonical
status: active
answers: ["How will components be categorized?", "What makes a valid component API?"]
---
# Component system

Implemented UI primitives are `Container`, `Section`, `SectionHeading`, `ButtonLink`, and `Card`. Implemented stable core components are `SkipLink`, `SiteHeader`, and `SiteFooter`, coordinated by `BaseLayout`. Implemented business-oriented compositions are `PageHero`, `StatusRegister`, `ServicesGrid`, `Locations`, and `ContactCTA`. They own local presentation while token, reset, global, utility, and print behavior remain in `src/styles/`. Form components remain a later phase.

Props describe meaning and content, not arbitrary pixel controls. Prefer native elements and direct page composition. Create a component when semantics or visual mechanics genuinely repeat; do not replace ordinary HTML with abstraction.
