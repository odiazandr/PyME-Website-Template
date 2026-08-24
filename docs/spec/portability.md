---
owner: docs/spec/portability.md
authority: canonical
status: active
answers: ["How does memory work across agent hosts?", "What happens when host automation is unavailable?"]
---
# Portability

Markdown, repository paths, lexical search, and documented commands are the portable baseline. Host-specific skills, hooks, permissions, and adapters are optional conveniences and never sole owners of policy.

Memory automation requires Python 3.11 or newer because it reads TOML through the standard library. Invoke it with the environment's Python 3 command (`python` in repository commands and CI). A missing or older interpreter may prevent the program from starting and must be reported by the invoking host as `UNVERIFIED`; it is outside the validator's own result contract. The validator uses only Python's standard library and a documented strict frontmatter subset; it does not require a network installation merely to inspect repository memory.

When an automation capability is unavailable, the underlying Markdown rule remains binding and the result is reported as `UNVERIFIED`, not passed.
