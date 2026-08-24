---
owner: docs/spec/project-state.md
authority: canonical
status: active
answers: ["How is repository implementation state represented?", "How are capability evidence states interpreted?"]
---
# Repository implementation state

`project-state.json` is the canonical compact statement of current implementation evidence. It routes agents away from inference; detailed requirements and rationale remain in their existing canonical specifications and ADRs.

The UTF-8 JSON file is limited to 65,536 bytes. The root object has exactly `schemaVersion`, `phase`, and `capabilities`. Schema version `1` is required. `phase` identifies the next active implementation phase and is one of `memory-integrity`, `implementation-state`, `runtime-foundation`, `data-foundation`, `design-foundation`, `core-runtime`, `site-fundamentals`, `security`, `production-validation`, `browser-qa`, `ci`, `deployment`, `client-initialization`, `lifecycle-validation`, `migration-validation`, `adversarial-hardening`, or `stable`.

Every schema-defined capability appears exactly once. Its state is one of:

- `not_implemented`: no accepted implementation exists;
- `planned`: canonical requirements exist, but implementation has not begun;
- `partial`: some implementation exists, but the capability contract is incomplete;
- `implemented`: the declared implementation exists, without sufficient verification evidence;
- `verified`: deterministic or review evidence verifies the capability within its declared local scope;
- `production_verified`: the capability has been verified in a real production-like lifecycle where that distinction is relevant;
- `deprecated`: the capability remains represented only for an explicit retirement or migration path.

State changes require evidence in the same reviewed change. Never promote a capability merely because documentation describes it, a command was intended to run, or adjacent work passed. Regressions and deprecations are allowed when reality requires them; record consequential causes in an ADR or changelog rather than preserving a false monotonic state. `production_verified` requires real lifecycle evidence and cannot be inferred from local tests. The project-state validator enforces structure and vocabulary, not the truthfulness of evidence; reviewers remain responsible for that judgment.
