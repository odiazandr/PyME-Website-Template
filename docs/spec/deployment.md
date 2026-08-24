---
owner: docs/spec/deployment.md
authority: canonical
status: active
answers: ["How will websites be deployed?", "What owns production configuration?"]
---
# Deployment

The intended default flow is a private GitHub client repository to Netlify: pull request, required checks, Deploy Preview, review, merge to `main` after repository rules protect it, production-quality build, `dist/`, CDN, and client-owned custom domain.

The implemented `netlify.toml` runs `npm run quality`, publishes `dist/`, supplies stable security headers, and gives immutable caching only to hashed Astro assets. This is a verified local configuration contract, not evidence of a successful Netlify deployment. Deploy Previews remain the standard planned review surface; permanent branch deployments are optional. Production rollback uses a source revert or a prior Netlify deploy. DNS changes follow their runbook and preserve mail-related records.

GitHub Actions separates deterministic quality from browser QA. `ci.yml` runs the locked install, memory contracts, development quality gate, and deterministic suite on pull requests and `main`. `browser-qa.yml` installs Chromium and WebKit on Ubuntu, runs the complete Playwright matrix, requires a report after successful execution, and retains any available report after failures. Both workflows use read-only repository permissions. Repository rules must be configured separately to make their checks mandatory.

The baseline remote evidence is commit `22f98bc015f062a53630f358bf687fb9710250cf`: [CI run 32750957058](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957058) and [Browser QA run 32750957034](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957034) both completed successfully on GitHub-hosted Ubuntu. This verifies the workflow contracts within that commit's scope; it is not Netlify deployment evidence.

Real deployment begins only after an authorized operator supplies an authenticated Netlify context and deliberately links the intended disposable/reference site. Absence of a Netlify CLI, authenticated session, or `.netlify/state.json` link is a stop condition for external deployment—not permission to create an arbitrary site, reuse unknown credentials, or change DNS. Site creation, deployment, form verification, header inspection, and rollback evidence must refer to the same explicitly identified Netlify site.
