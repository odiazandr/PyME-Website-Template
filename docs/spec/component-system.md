---
owner: docs/spec/component-system.md
authority: canonical
status: active
answers: ["How will components be categorized?", "What makes a valid component API?"]
---
# Component system

Planned categories are stable core components, small UI primitives, business-oriented section compositions, and form components. Components own their local presentation while global CSS remains foundation-level.

Props describe meaning and content, not arbitrary pixel controls. Prefer native elements and direct page composition. Create a component when semantics or visual mechanics genuinely repeat; do not replace ordinary HTML with abstraction.
