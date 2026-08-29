# Project constitution

Project: `PyME Website Foundation`

Purpose: Provide a versioned, production-grade foundation for independent, client-owned Mexican PyME websites that humans and AI agents can customize and maintain without architectural drift.

## Invariants

1. This repository is a template product. Each adopted client repository produces one public, client-owned business website. Do not convert this canonical template repository into a client site, paste real client facts into it, or link it to a client Netlify project.
2. Static rendering is the default. Complexity is introduced only when verified requirements justify it.
3. Every durable fact has exactly one canonical owner. If canonical sources conflict, stop and report the conflict.
4. Business claims must be verified. Never invent a fact about the business, including but not limited to awards, certifications, testimonials, experience, prices, guarantees, credentials, availability, statistics, and address, contact, or location details. A plausible value is not a verified one; when a fact has not been supplied, leave it absent and say so rather than inferring it.
5. Semantic HTML and CSS precede browser JavaScript. Client-side frameworks require explicit justification.
6. Databases, custom authentication, custom backends, private state, and transaction systems require architecture review and an ADR.
7. No secret or private operational data may enter browser-visible code, public manifests, or committed repository data.
8. Accessibility, mobile usability, security, privacy, SEO, and production validation are part of the definition of done.
9. Third-party services require security, privacy, performance, failure-mode, and CSP review.
10. `main` represents production-ready code once runtime implementation begins.
11. Project-mode production may not contain unresolved client-work markers. The marker contract and scan scope are owned by `docs/spec/validation.md`.
12. The client owns its business domain unless a written exception exists.
13. The future operations dashboard is a separate project. A client website must never require it to function.
14. Decisions are append-only in `docs/decisions/`; supersede rather than rewriting history.
15. Archives are cold. Do not read archived files unless the task explicitly requires history.
16. The sole canonical Git remote is `https://github.com/odiazandr/PyME-Website-Template.git`. Do not fetch from, push to, synchronize with, or restore a remote relationship to the Universal Memory Template repository.
17. Capability claims must distinguish planned, partial, implemented, verified, and production-verified states. Documentation and automation may not imply evidence that does not exist.
18. Runtime implementation begins only after memory validation is trustworthy within its declared scope.
19. Runtime data schemas have one canonical implementation owner. Any external schema representation is derived rather than independently maintained.

## Retrieval route

1. Inspect the optional Active Working Set when available.
2. Read `docs/INDEX.md`.
3. Read `docs/GLOSSARY.md` when interpreting or introducing project vocabulary.
4. Search filenames and headings before document bodies.
5. Read the canonical owner; use derived explanations only as aids.
6. Report missing owners, duplicate authorities, dead pointers, and stale adapters as memory defects.

## Knowledge locations

| Information | Location |
|---|---|
| Current requirements and architecture | `docs/spec/` |
| Consequential decisions and rationale | `docs/decisions/` |
| Repeatable operations | `docs/runbooks/` |
| Plain-language teaching | `docs/explain/` |
| Superseded material | `docs/archive/` |
| Reusable agent procedures | `.agents/skills/` |
| Task-scoped retrieval pointers | `.memory/working-sets/` |
| Repository identity and upstream boundary | `docs/spec/repository-identity.md` |

## Project checks

Project-specific checks are configured in `memory.toml`. Empty commands are `NOT_CONFIGURED`, never passed. Run memory health with `python ops/memory_health.py`.

## Definition of done

- The requested outcome is complete and relevant configured checks pass.
- New durable facts have one canonical owner.
- Architecture changes update their canonical specification and, when consequential, add an ADR.
- `docs/INDEX.md` lists every active knowledge document exactly once.
- New terms are defined once in `docs/GLOSSARY.md`.
- No secrets, personal data, fabricated claims, or unrelated project material enter the repository.
