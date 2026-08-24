---
owner: docs/runbooks/adopt-template.md
authority: canonical
status: active
answers: ["How is the foundation safely adopted?"]
---
# Adopt the foundation

1. Create an independent private repository from the canonical template.
2. Record the source template release.
3. Run the client initializer when implemented.
4. Change `memory.toml` from template to project mode.
5. Replace defined placeholders with verified project facts.
6. Review `PROJECT.md` invariants without duplicating them elsewhere.
7. Run memory and project checks; record every unavailable check as unverified.
