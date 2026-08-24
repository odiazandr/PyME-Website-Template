---
owner: docs/explain/how-deployment-works.md
authority: derived
status: active
answers: ["How does deployment work in plain language?"]
---
# How deployment works

Work happens on a branch. A pull request runs checks and receives a temporary preview. After review, merging to `main` builds the static site and publishes it through Netlify to the client's domain. A prior deploy and recorded DNS state provide recovery paths.

Canonical policy lives in `docs/spec/deployment.md`.
