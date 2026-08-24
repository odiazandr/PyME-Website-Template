---
owner: docs/decisions/0109-independent-template-versioning.md
authority: canonical
status: active
answers: ["Why are template updates explicit migrations?"]
---
# ADR 0109: Independent template versioning

Status: accepted.

Repositories created from the template are independent and will drift legitimately. Foundation releases therefore publish migration instructions; client adoption occurs through reviewed branches, checks, and previews rather than automatic synchronization.
