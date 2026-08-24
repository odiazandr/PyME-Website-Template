---
owner: docs/spec/architecture.md
authority: canonical
status: active
answers: ["What is the website architecture?", "Which technologies are defaults?"]
---
# Architecture

The governing rule is: static by default, explicit by default, native by default, managed services before custom infrastructure, and complexity only when requirements prove it necessary.

The implemented runtime foundation is Node.js 24 LTS, npm, Astro 7 static output, the tested TypeScript 6 compatibility line, and semantic HTML. Exact direct versions are pinned in `package.json`; `package-lock.json` owns the complete resolved dependency graph. Astro owns Vite integration. The base has no client-side framework and no Netlify adapter. Netlify remains the planned default static host; server-side or on-demand features require a later architecture decision.

The verified core runtime generates seven explicit static reference pages plus `robots.txt` and sitemap artifacts, and consumes the implemented, Zod-validated business data and site configuration. `BaseLayout` coordinates shared document structure, metadata, optional structured data, skip navigation, header, navigation, and footer. Pages compose small UI, business-section, and form primitives directly; there is no page-builder abstraction and no client-side application runtime. The responsive navigation and progressive contact form require no JavaScript.

Astro-managed CSP, repository-controlled Netlify header configuration, strict source-and-artifact production validation, and Chromium browser automation are implemented and locally verified. The complete Chromium/WebKit matrix and deterministic CI also pass on GitHub-hosted Ubuntu; WebKit remains environment-blocked only on the current Windows host. A real deployment remains a later phase. Do not infer production readiness merely because the reference site and automated contracts pass.
