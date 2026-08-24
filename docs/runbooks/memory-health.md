---
owner: docs/runbooks/memory-health.md
authority: canonical
status: active
answers: ["How is memory health checked?"]
---
# Review memory health

Run `python ops/memory_health.py` for the full human-readable result or `python ops/memory_health.py --json` for machine-readable evidence. Use `python ops/memory_health.py --scope contracts` only when intentionally checking repository-memory contracts without project commands. The full command validates memory contracts and reports every configured project check individually. Investigate every failure or unverified result instead of weakening the contract.

Exit code `0` means passed, `1` means failed, and `2` means unverified. Semantic overlap, dead prose links, lifecycle correctness, archive intent, and hostile concurrent filesystem replacement still require review; deterministic checks do not replace judgment.
