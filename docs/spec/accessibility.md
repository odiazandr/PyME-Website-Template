---
owner: docs/spec/accessibility.md
authority: canonical
status: active
answers: ["What is the accessibility target?", "Which checks are required?"]
---
# Accessibility

The engineering target is WCAG 2.2 AA-oriented implementation, not an unsupported certification claim. Native semantics precede ARIA.

The implemented foundation provides correct language, landmarks, a skip link, logical headings, native-link navigation, visible focus, reviewed contrast, labeled form controls, native validation, suitable control targets, reduced-motion support, and no client-side interaction traps. The contact form connects its hint to the relevant field and remains usable without JavaScript.

Playwright and Axe now verify every user-facing route in desktop, mobile, and 320-pixel-wide Chromium, failing on every violation returned by the selected WCAG A/AA tags. Axe injection uses a test-local CSP bypass because the scanner itself is injected browser code; ordinary smoke tests run under the configured CSP. Those smoke tests verify skip-link focus transfer, native and provider-compatible form behavior, navigation status, 404 behavior, and horizontal-overflow absence. The first browser runs found and corrected a real focus-transfer defect and a focus-ring contrast defect.

The WebKit project cannot run on the current Windows host because Playwright cannot load its bundled `psl-5.dll`, but the complete Chromium/WebKit suite passes on GitHub-hosted Ubuntu. Automation complements—not replaces—manual keyboard, zoom, focus, form, heading, image, motion, and responsive review. The implementation therefore remains partial against the complete accessibility evidence contract.
