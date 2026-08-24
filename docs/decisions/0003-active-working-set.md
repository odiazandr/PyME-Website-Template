---
owner: docs/decisions/0003-active-working-set.md
authority: canonical
status: active
answers: ["Why does the project use Active Working Sets?"]
---
# ADR 0003: Active Working Set

Status: accepted.

Permit bounded local pointer caches to reduce repeated discovery in a documentation-rich repository. They never copy facts, never constrain search, and degrade safely to ordinary retrieval.
