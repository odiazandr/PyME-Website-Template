---
owner: docs/spec/browser-support.md
authority: canonical
status: active
answers: ["Which browsers must the website support?", "What is the progressive-enhancement and polyfill policy?"]
---
# Browser support

The foundation targets modern evergreen browsers that still receive vendor security updates, including Chromium-based desktop browsers, Firefox, Safari/WebKit, and Chrome on supported Android devices. Browser QA must include at least Chromium and WebKit plus mobile and desktop viewports before production readiness can be claimed.

Semantic content, navigation, contact information, and HTML form submission must remain usable without client-side JavaScript. CSS may use broadly supported modern features when the fallback preserves reading order and essential actions. Experimental features require an explicit compatibility review and graceful fallback. No legacy-browser polyfill bundle ships by default; add a polyfill only for a verified client requirement and document its cost and retirement condition.

This contract defines the intended support class. Automated cross-browser evidence remains planned until the browser-QA phase.
