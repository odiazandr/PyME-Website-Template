---
owner: docs/spec/browser-support.md
authority: canonical
status: active
answers: ["Which browsers must the website support?", "What is the progressive-enhancement and polyfill policy?"]
---
# Browser support

The foundation targets modern evergreen browsers that still receive vendor security updates, including Chromium-based desktop browsers, Firefox, Safari/WebKit, and Chrome on supported Android devices. Browser QA must include at least Chromium and WebKit plus mobile and desktop viewports before production readiness can be claimed.

Semantic content, navigation, contact information, and HTML form submission must remain usable without client-side JavaScript. CSS may use broadly supported modern features when the fallback preserves reading order and essential actions. Experimental features require an explicit compatibility review and graceful fallback. No legacy-browser polyfill bundle ships by default; add a polyfill only for a verified client requirement and document its cost and retirement condition.

Playwright defines desktop Chromium, mobile Chromium (Pixel 7), narrow Chromium at 320×568, and tablet WebKit (iPad) projects. All three Chromium classes are locally verified, and the complete Chromium/WebKit matrix is verified on GitHub-hosted Ubuntu. WebKit remains unavailable on the current Windows host because Playwright cannot load its bundled `psl-5.dll`; that local limitation does not erase the retained CI evidence. Firefox automation remains a later expansion.
