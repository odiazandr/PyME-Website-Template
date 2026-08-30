---
owner: docs/runbooks/local-development.md
authority: canonical
status: active
answers: ["How does local development work?"]
---

# Local development

Use Node 24 from `.nvmrc`. Run `npm ci` to reproduce `package-lock.json`, then `npm run dev` for the local Astro server. Use `npm run format:check`, `npm run check`, `npm run validate:data`, and `npm run build` for focused runtime verification, or `python ops/memory_health.py` for the full repository contract and configured-check result.

The available npm commands are `dev`, `build`, `preview`, `check`, `format`, `format:check`, `validate:data`, `quality:static`, `quality`, `verify:deployment`, `test:memory`, `test:data`, and `test`. `verify:deployment` is an authenticated read-only Netlify check, not a local development gate. Formatting is intentionally scoped to runtime-owned source, tests, scripts, and configuration; repository-memory Markdown is governed by its structural validator rather than bulk formatting. The generated `.astro/`, `dist/`, and `node_modules/` directories are local artifacts and must not be committed.

## Sync after a squash merge

First inspect `git status`. If the working tree contains work to preserve, commit it or make a patch before changing branches. Then fetch `origin/main`, switch to `main`, and rebase or merge the fetched branch as appropriate. Only reset a local branch to `origin/main` after confirming its uncommitted and unpushed work may be discarded; `git reset --hard` is not a routine synchronization command.
