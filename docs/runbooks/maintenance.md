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

## Recorded compatibility decisions

Green CI is not by itself evidence of compatibility. A type-definition package describes a runtime the repository does not necessarily run; the gates typecheck against whatever definitions they are given and cannot detect that the described runtime is ahead of the pinned engine.

| Proposal | CI evidence | Decision |
|---|---|---|
| `typescript` 6 to 7 | Both required checks failed | Do not merge. The failure is direct evidence for the Astro-compatible line this runbook declares. Revisit when the Astro toolchain supports it. |
| `@types/node` 24 to 26 | Both required checks passed | Do not merge on that basis. `package.json` pins `engines.node` to `>=24 <25`; definitions for Node 26 would let code that calls a Node 26 API typecheck cleanly and fail at runtime on the pinned major. Merge only together with a deliberate engine change. |
| Major GitHub Action bumps | Mixed; several failed | Rebase onto current `main` and require fresh evidence before judging. A red check on a stale branch says nothing about `main`. |

Record the outcome here when one of these lines moves, so a future reader sees the reasoning rather than re-deriving it from a pull-request queue.
