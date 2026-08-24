---
owner: docs/decisions/0100-static-first-architecture.md
authority: canonical
status: active
answers: ["Why is the website static by default?"]
---
# ADR 0100: Static-first architecture

Status: accepted.

Most target sites publish public business information. Static output reduces attack surface, operational burden, latency, browser work, and failure modes. Dynamic infrastructure is introduced only for requirements that cannot be met appropriately by static output or managed services.
