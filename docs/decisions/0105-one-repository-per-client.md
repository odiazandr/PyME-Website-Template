---
owner: docs/decisions/0105-one-repository-per-client.md
authority: canonical
status: active
answers: ["Why does every client have an independent repository?"]
---
# ADR 0105: One repository per client

Status: accepted.

Independent private repositories preserve ownership, permissions, history, deployment, migration review, and lifecycle isolation. Client sites are created from the GitHub template rather than stored in a production monorepo.
