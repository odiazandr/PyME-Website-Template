# PyME Website Foundation

A repository-native foundation for creating independent, client-owned websites for small and medium businesses in Mexico.

Canonical repository: `https://github.com/odiazandr/PyME-Website-Template.git`

The repository contains its constitution and memory architecture plus a verified static Astro reference website, canonical business data, neutral design system, SEO output, privacy integration, progressive contact form, Astro-managed CSP, repository-controlled Netlify headers, a public site manifest, and strict source-and-artifact production validation. Browser automation and real deployment remain later phases.

## Start here

1. Read `AGENTS.md`.
2. Read `PROJECT.md`.
3. Use `docs/INDEX.md` to locate the canonical owner for a subject.
4. Follow `docs/runbooks/adopt-template.md` when creating a client repository.

## Current phase

Phases 1.1 through 8 are complete within their declared local scopes. `project-state.json` identifies browser QA as the next phase; accessibility remains partial and Netlify deployment remains only partially implemented until external evidence exists.

Implemented runtime boundaries and the remaining planned layers are documented in `docs/spec/architecture.md`. `project-state.json` is the concise evidence-level source of truth.

The development gate is `npm run quality`. The stricter `npm run quality:production` command intentionally rejects this uninitialized distribution template; it passes only after a client repository enters project mode and replaces sample identity, domain, and legal content.
