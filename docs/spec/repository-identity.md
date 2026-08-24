---
owner: docs/spec/repository-identity.md
authority: canonical
status: active
answers: ["What is the canonical Git repository?", "May this project synchronize with the Universal Memory Template repository?"]
---
# Repository identity

The sole canonical Git remote for this project is:

`https://github.com/odiazandr/PyME-Website-Template.git`

The local remote name is `origin`, and both fetch and push URLs must resolve to that address.

The Universal Memory Template was an architectural source used during initial adoption. It is not an upstream, dependency, submodule, subtree, fetch remote, push remote, or synchronization target. Future memory-framework changes must be evaluated and implemented as explicit changes within this repository; agents must not restore an external repository relationship.

Commits, branches, tags, and pushes for this project target the canonical PyME Website Template repository only. Pushing still requires an explicit task or authorization; repository identity does not itself authorize publication.
