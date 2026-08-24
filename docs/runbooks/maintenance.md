---
owner: docs/runbooks/maintenance.md
authority: canonical
status: active
answers: ["What recurring website maintenance is required?"]
---
# Maintenance

Periodically review dependencies, broken links, contact facts, hours, forms, domain and TLS state, search health, performance, accessibility, integrations, retention obligations, and adopted template version. Changes use the normal branch, checks, preview, and review path.

## Dependency pull-request triage

Treat each dependency PR as an independent proposed migration. Before acting, compare its head with current `main` and inspect the exact failed step. A red check on a stale branch does not establish that current `main` is broken; rebase the PR and require fresh CI evidence. Do not merge merely to clear a red indicator.

Keep dependency updates inside the repository's declared compatibility lines unless an explicit review changes those contracts. In particular, Node type definitions should match the pinned Node major, and TypeScript must remain on the documented Astro-compatible line. Major GitHub Action updates require the same rebase, immutable-SHA verification, CI, browser QA, and review as other major dependencies. Close or defer incompatible proposals instead of weakening checks.
