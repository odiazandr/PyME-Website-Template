---
owner: docs/spec/deployment.md
authority: canonical
status: active
answers: ["How will websites be deployed?", "What owns production configuration?"]
---
# Deployment

The default flow is a private GitHub client repository to Netlify: pull request, required checks, Deploy Preview, review, merge to protected `main`, production-quality build, `dist/`, CDN, and client-owned custom domain.

Repository configuration owns build and header settings where practical. Deploy Previews are the standard review surface; permanent branch deployments are optional. Production rollback uses a source revert or a prior Netlify deploy. DNS changes follow their runbook and preserve mail-related records.
