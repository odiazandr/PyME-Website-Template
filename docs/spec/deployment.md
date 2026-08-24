---
owner: docs/spec/deployment.md
authority: canonical
status: active
answers: ["How will websites be deployed?", "What owns production configuration?"]
---
# Deployment

The default flow is a private GitHub client repository to Netlify: pull request, required checks, Deploy Preview, review, merge to protected `main`, production-quality build, `dist/`, CDN, and client-owned custom domain.

The implemented `netlify.toml` runs `npm run quality`, publishes `dist/`, supplies stable security headers, and gives immutable caching only to hashed Astro assets. This is a verified local configuration contract, not evidence of a successful Netlify deployment. Deploy Previews remain the standard planned review surface; permanent branch deployments are optional. Production rollback uses a source revert or a prior Netlify deploy. DNS changes follow their runbook and preserve mail-related records.
