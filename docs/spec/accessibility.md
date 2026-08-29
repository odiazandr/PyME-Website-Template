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

The WebKit project now launches on the current Windows host, but its iPad-emulation sequential-Tab behavior is not a reliable substitute for hardware-keyboard evidence. The skip-link test therefore verifies activation after direct focus on that project and retains sequential Tab coverage on Chromium. The complete Chromium/WebKit suite remains verified on GitHub-hosted Ubuntu at its recorded baseline; current-host results must be scoped to their own commit and environment. Automation complements—not replaces—manual keyboard, zoom, focus, form, heading, image, motion, and responsive review. The implementation therefore remains partial against the complete accessibility evidence contract.
