---
owner: docs/spec/architecture.md
authority: canonical
status: active
answers: ["What is the website architecture?", "Which technologies are defaults?"]
---
# Architecture

The governing rule is: static by default, explicit by default, native by default, managed services before custom infrastructure, and complexity only when requirements prove it necessary.

The implemented runtime foundation is Node.js 24 LTS, npm, Astro 7 static output, the tested TypeScript 6 compatibility line, and semantic HTML. Exact direct versions are pinned in `package.json`; `package-lock.json` owns the complete resolved dependency graph. Astro owns Vite integration. The base has no client-side framework and no Netlify adapter. Netlify remains the planned default static host; server-side or on-demand features require a later architecture decision.

The verified bootstrap currently generates one static reference route and consumes the implemented, Zod-validated business data and site configuration. Later application layers remain planned: full explicit Astro routes and content; layouts and semantic components; design tokens and scoped styling; narrowly justified browser behavior; production validation; and deployment. Do not infer that the reference website or production gates exist merely because the runtime builds.
