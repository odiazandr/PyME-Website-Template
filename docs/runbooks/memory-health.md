---
owner: docs/runbooks/memory-health.md
authority: canonical
status: active
answers: ["How is memory health checked?"]
---
# Review memory health

Run `python ops/memory_health.py`. It verifies frontmatter, owner paths, unique normalized ownership questions, index coverage, and forbidden active placeholders in project mode. Investigate every failure instead of weakening the contract.

Semantic overlap, dead prose links, lifecycle correctness, and archive intent still require review; deterministic checks do not replace judgment.
