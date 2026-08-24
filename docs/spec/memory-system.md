---
owner: docs/spec/memory-system.md
authority: canonical
status: active
answers: ["How is repository knowledge organized?", "What do authority and lifecycle mean?"]
---
# Memory system

Knowledge is repository-native, vendor-neutral, and readable with ordinary files and search. T0 contains the constitution; T1 routes and defines vocabulary; T2 owns current specifications, runbooks, and explanations; T3 preserves decisions; T4 is cold archive.

Every active knowledge document declares an owner path, authority (`canonical`, `derived`, or `scratch`), status, and the questions it answers. One durable fact has one canonical owner. Derived material points to that owner. Scratch material cannot establish policy.

Active discovery is recursive only within the roots and exclusions defined by `docs/spec/validation.md`. Directory placement alone does not create authority, but an active knowledge file outside the declared discovery contract is a memory defect until it is either routed into an owned root or explicitly classified as machinery/cold history.

When knowledge is replaced, establish the replacement, record the decision, update pointers, mark the prior document superseded, then archive it. Host memory and chat may propose updates but never own durable facts.
