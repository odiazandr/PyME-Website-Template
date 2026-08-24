---
owner: docs/decisions/0005-memory-validator-hardening.md
authority: canonical
status: active
answers: ["Why does memory validation use explicit strict contracts?"]
---
# ADR 0005: Harden memory validation with explicit strict contracts

Status: accepted.

## Context

The first adversarial campaign demonstrated that the original validator could pass invalid modes, stale or duplicate index state, invalid metadata, failing configured commands, and incomplete placeholder scans. It could also crash on malformed input and reject documentation that merely explained the placeholder syntax.

## Decision

Keep memory tooling dependency-free, but define a strict frontmatter subset instead of claiming general YAML support. Validate configuration and metadata types/enums, discover active knowledge recursively through explicit roots, parse index entries structurally with exact cardinality, use Unicode-aware ownership keys, redesign unresolved tokens, handle malformed state as data, and report configured checks individually.

Implementation state must remain explicit: documenting this contract does not mark it implemented or verified. Phase 1.1 is complete only after negative and mutation-style tests demonstrate the contract.

## Consequences

The accepted frontmatter grammar is intentionally narrower than YAML. Contributors receive precise errors instead of permissive parsing. Future grammar expansion requires a schema-version decision and migration rather than accidental parser behavior.
