---
owner: docs/spec/accessibility.md
authority: canonical
status: active
answers: ["What is the accessibility target?", "Which checks are required?"]
---
# Accessibility

The engineering target is WCAG 2.2 AA-oriented implementation, not an unsupported certification claim. Native semantics precede ARIA.

The implemented foundation provides correct language, landmarks, a skip link, logical headings, native-link navigation, visible focus, reviewed contrast, labeled form controls, native validation, suitable control targets, reduced-motion support, and no client-side interaction traps. The contact form connects its hint to the relevant field and remains usable without JavaScript.

Automated Axe-assisted and cross-browser checks remain planned and will complement—not replace—manual keyboard, zoom, focus, form, heading, image, motion, and responsive review. The current implementation is therefore partial against the complete accessibility evidence contract.
