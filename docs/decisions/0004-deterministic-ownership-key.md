---
owner: docs/decisions/0004-deterministic-ownership-key.md
authority: canonical
status: active
answers: ["Why are ownership questions normalized for validation?"]
---
# ADR 0004: Deterministic ownership key

Status: accepted.

Use normalized `answers` questions as deterministic collision signals, followed by semantic review. This catches many duplicate owners without pretending lexical equality can prove conceptual uniqueness.
