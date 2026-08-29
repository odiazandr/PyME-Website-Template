---
owner: docs/spec/browser-support.md
authority: canonical
status: active
answers: ["Which browsers must the website support?", "What is the progressive-enhancement and polyfill policy?"]
---
# Browser support

The foundation targets modern evergreen browsers that still receive vendor security updates, including Chromium-based desktop browsers, Firefox, Safari/WebKit, and Chrome on supported Android devices. Browser QA must include at least Chromium and WebKit plus mobile and desktop viewports before production readiness can be claimed.

Semantic content, navigation, contact information, and HTML form submission must remain usable without client-side JavaScript. CSS may use broadly supported modern features when the fallback preserves reading order and essential actions. Experimental features require an explicit compatibility review and graceful fallback. No legacy-browser polyfill bundle ships by default; add a polyfill only for a verified client requirement and document its cost and retirement condition.

Playwright defines desktop Chromium, mobile Chromium (Pixel 7), narrow Chromium at 320×568, and tablet WebKit (iPad) projects. All three Chromium classes are locally verified. Tablet WebKit launches on the current Windows host, but its iPad-emulation sequential-Tab behavior remains an environment limitation rather than product proof; its current evidence is not a replacement for supported-host or hardware verification. The complete Chromium/WebKit matrix is verified on GitHub-hosted Ubuntu at its recorded baseline. Firefox automation remains a later expansion.
