---
owner: docs/spec/portability.md
authority: canonical
status: active
answers: ["How does memory work across agent hosts?", "What happens when host automation is unavailable?"]
---
# Portability

Markdown, repository paths, lexical search, and documented commands are the portable baseline. Host-specific skills, hooks, permissions, and adapters are optional conveniences and never sole owners of policy.

When an automation capability is unavailable, the underlying Markdown rule remains binding and the result is reported as `UNVERIFIED`, not passed.
