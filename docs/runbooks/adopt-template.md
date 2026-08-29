---
owner: docs/runbooks/adopt-template.md
authority: canonical
status: active
answers: ["How is the foundation safely adopted?"]
---
# Adopt the foundation

Run this procedure in the new client repository, not in `PyME-Website-Template`. The canonical template remains reusable product source; the client repository owns one business website, its verified facts, its deployment link, and its future maintenance history.

1. Create an independent private GitHub repository from the canonical template.
2. Clone or open that client repository as its own local project folder.
3. Record the source template release.
4. Run the client initializer, which also moves `memory.toml` from template to project mode. The procedure is owned by `docs/runbooks/create-client-site.md`.
5. Replace the remaining placeholders with verified project facts.
6. Review `PROJECT.md` invariants without duplicating them elsewhere.
7. Run memory and project checks; record every unavailable check as unverified.
8. Link deployment providers only from the client repository. The canonical template repository must not be linked to a client's Netlify site.
