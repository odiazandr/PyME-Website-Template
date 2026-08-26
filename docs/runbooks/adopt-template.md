---
owner: docs/runbooks/adopt-template.md
authority: canonical
status: active
answers: ["How is the foundation safely adopted?"]
---
# Adopt the foundation

1. Create an independent private repository from the canonical template.
2. Record the source template release.
3. Run the client initializer, which also moves `memory.toml` from template to project mode. The procedure is owned by `docs/runbooks/create-client-site.md`.
4. Replace the remaining placeholders with verified project facts.
5. Review `PROJECT.md` invariants without duplicating them elsewhere.
6. Run memory and project checks; record every unavailable check as unverified.
