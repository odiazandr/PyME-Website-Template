---
owner: docs/runbooks/local-development.md
authority: canonical
status: active
answers: ["How does local development work?"]
---
# Local development

Use Node 24 from `.nvmrc`. Run `npm ci` to reproduce `package-lock.json`, then `npm run dev` for the local Astro server. Use `npm run format:check`, `npm run check`, `npm run validate:data`, and `npm run build` for focused runtime verification, or `python ops/memory_health.py` for the full repository contract and configured-check result.

The available npm commands are `dev`, `build`, `preview`, `check`, `format`, `format:check`, `validate:data`, `quality:static`, `quality`, `test:memory`, `test:data`, and `test`. Formatting is intentionally scoped to runtime-owned source, tests, scripts, and configuration; repository-memory Markdown is governed by its structural validator rather than bulk formatting. The generated `.astro/`, `dist/`, and `node_modules/` directories are local artifacts and must not be committed.
