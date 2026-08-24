---
owner: docs/decisions/0001-repository-native-memory.md
authority: canonical
status: active
answers: ["Why is project memory repository-native?"]
---
# ADR 0001: Repository-native memory

Status: accepted.

Use versioned Markdown, paths, and lexical search as the durable memory substrate. This remains available to humans and agents without a vendor service, preserves review history, and keeps client repositories self-contained. RAG or host memory may assist retrieval but cannot own truth.
