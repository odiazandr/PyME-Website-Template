---
owner: docs/decisions/0006-machine-readable-project-state.md
authority: canonical
status: active
answers: ["Why does the repository have machine-readable implementation state?"]
---
# ADR 0006: Add machine-readable project state

Status: accepted.

## Context

The repository deliberately documents architecture before implementing it. Humans and agents could therefore confuse planned files and capabilities with working or verified behavior.

## Decision

Maintain one strictly validated root `project-state.json` with the current implementation phase and an explicit state for every tracked capability. Detailed contracts stay in their existing canonical owners; the state file records evidence level only.

## Consequences

Automation can route work without guessing from prose. Every capability addition or schema change must update the validator and canonical state specification together. Structural validation cannot prove that an evidence claim is honest, so promotion still requires review and relevant test or lifecycle evidence.
