# Adversarial repository validation — 2026-08-24

## Executive summary

The repository has a strong conceptual architecture and unusually clear global invariants, but its current automated memory health signal is not reliable enough to act as a merge or production oracle. The campaign confirmed multiple false-pass paths, one self-defeating project-mode rule, and unhandled malformed-input crashes. The present two-test suite validates only the happy path.

The highest-impact weakness is a gap between what the memory specifications say is enforced and what `ops/memory_health.py` actually enforces. A repository can report `MEMORY HEALTH: PASSED` with an invalid mode, stale index entries, invalid authority/status values, duplicate index entries, failing configured commands, or placeholders outside a narrow scan. Conversely, switching the canonical repository to project mode fails immediately because `PROJECT.md` contains the literal placeholder syntax while explaining the rule.

Interpretation testing showed that the root routing model works: a context-limited agent correctly reached `PROJECT.md`, `docs/INDEX.md`, and the location runbook without inventing a runtime. Divergence appeared around operational readiness, recovery evidence, security reporting, planned versus implemented ownership, and what counts as active indexed knowledge.

Confidence is high for the validator findings because they were reproduced in disposable copies and sampled across 100 seeded scenarios. Confidence is medium for future runtime, deployment, CSP, DNS, and external-provider risks because no Astro runtime, CI, Netlify site, domain, or production system exists yet.

## Tested scope

- Root and agent instructions, canonical routing, glossary, specifications, ADRs, runbooks, and reserved-path documentation.
- Memory frontmatter parsing, ownership-question normalization, index coverage behavior, mode handling, placeholder behavior, configured-check behavior, malformed TOML, invalid encoding, and unit-test adequacy.
- Limited-context README, agent-entry, and operator/security interpretation.
- Git origin identity and canonical-integrity preservation.
- Seeded mutation scenarios across mode, document presence, metadata, index state, placeholder location, and encoding.

## Untested or not applicable

- Astro installation, builds, browser runtime, schemas, forms, SEO output, CSP output, Netlify headers, Playwright, accessibility automation, deployment, DNS, external integrations, upgrades, and rollback execution: not implemented or not connected.
- POSIX case-sensitive execution and older supported Python versions: not available in this Windows campaign.
- Live GitHub rulesets, permissions, Actions, security advisories, and remote push behavior: no network or external mutations were permitted.

## Most important findings

1. `AV-001` — Invalid or missing memory mode bypasses project rules.
2. `AV-002` — Project mode rejects the constitution's own explanatory marker.
3. `AV-003` — A deleted indexed canonical document can still pass.
4. `AV-004` — Invalid metadata values and shapes can pass.
5. `AV-005` — Index cardinality is not enforced.
6. `AV-006` — Configured project checks are never executed or reported.
7. `AV-007` — Project placeholder scanning is incomplete.
8. `AV-008` — Malformed configuration/encoding can crash the validator.
9. `AV-009` — The tests do not exercise negative behavior.
10. `AV-010` — Site ID and several content domains lack an explicit future storage owner.

The complete structured register is in `findings.json`.

## Final assessment

Architecture robustness: **promising but not yet enforceable**.

Operational robustness: **not yet measurable**, because runtime and deployment machinery are intentionally absent.

Memory-validator robustness: **insufficient for gating until high-priority false passes and the project-mode false positive are fixed**.

Overall confidence: **high for the current documentation/memory layer; low-to-medium for future runtime and operations**.
