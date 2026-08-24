# PyME Website Foundation

A repository-native foundation for creating independent, client-owned websites for small and medium businesses in Mexico.

Canonical repository: `https://github.com/odiazandr/PyME-Website-Template.git`

The repository contains its constitution and memory architecture plus a verified static Astro reference website, canonical business data, neutral design system, SEO output, privacy integration, progressive contact form, Astro-managed CSP, repository-controlled Netlify headers, a public site manifest, strict source-and-artifact production validation, and verified Chromium/WebKit browser automation. Manual accessibility review and real Netlify deployment remain incomplete.

## Start here

1. Read `AGENTS.md`.
2. Read `PROJECT.md`.
3. Use `docs/INDEX.md` to locate the canonical owner for a subject.
4. Follow `docs/runbooks/adopt-template.md` when creating a client repository.

## Current phase

Phases 1.1 through 8 are complete within their declared local scopes. Phase 9 browser QA and Phase 10 CI are verified on GitHub-hosted Ubuntu across desktop, mobile, and narrow Chromium plus tablet WebKit. Manual accessibility review remains outstanding, and Phase 11 Netlify deployment has not yet been proven in a real deployment.

Implemented runtime boundaries and the remaining planned layers are documented in `docs/spec/architecture.md`. `project-state.json` is the concise evidence-level source of truth.

The development gate is `npm run quality`. The stricter `npm run quality:production` command intentionally rejects this uninitialized distribution template; it passes only after a client repository enters project mode and replaces sample identity, domain, and legal content.
