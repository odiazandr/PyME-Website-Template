---
owner: docs/spec/architecture.md
authority: canonical
status: active
answers: ["What is the planned website architecture?", "Which technologies are defaults?"]
---
# Architecture

The governing rule is: static by default, explicit by default, native by default, managed services before custom infrastructure, and complexity only when requirements prove it necessary.

The planned runtime is Node.js 24 LTS, npm, Astro 7 static output, the tested TypeScript 6 compatibility line, semantic HTML, modern plain CSS, and minimal browser JavaScript. Astro owns Vite integration. Netlify is the default static host and does not require a Netlify adapter unless server-side or on-demand features are introduced.

The application layers will be: validated business data and configuration; explicit Astro routes and content; layouts and semantic components; design tokens and scoped styling; narrowly justified browser behavior; build and validation; static output. This phase documents that architecture but intentionally does not implement the runtime.
