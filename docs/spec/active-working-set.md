---
owner: docs/spec/active-working-set.md
authority: canonical
status: active
answers: ["What is an Active Working Set?", "How does Working Set fallback behave?"]
---
# Active Working Set

A Working Set is a local relevance cache containing a task description and a bounded list of repository pointers with short reasons. It copies no project facts and cannot restrict discovery.

Validate each likely pointer before reading it. If the set is missing, stale, insufficient, or conflicts with the repository, discard the affected pointer and resume normal retrieval through `docs/INDEX.md`.
