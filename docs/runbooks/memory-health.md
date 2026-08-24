---
owner: docs/runbooks/memory-health.md
authority: canonical
status: active
answers: ["How is memory health checked?"]
---
# Review memory health

Run `python ops/memory_health.py`. During Phase 1.1 the implementation is partial; consult `docs/spec/validation.md` and the current tests before treating its success output as evidence. The completed command will validate memory contracts and report every configured project check individually. Investigate every failure instead of weakening the contract.

Semantic overlap, dead prose links, lifecycle correctness, and archive intent still require review; deterministic checks do not replace judgment. Use JSON output once implemented when CI or another tool needs machine-readable evidence.
