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

Repository-control checkpoint recorded 2026-08-24: GitHub's branch API reported `main` as unprotected. This is an external configuration gap, not a source-code failure. Re-query GitHub before acting, then configure a ruleset requiring pull requests and both CI jobs, disallowing force pushes and branch deletion, with an intentional emergency-bypass policy. Do not claim protection until GitHub reports it active.

The baseline remote evidence is commit `22f98bc015f062a53630f358bf687fb9710250cf`: [CI run 32750957058](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957058) and [Browser QA run 32750957034](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957034) both completed successfully on GitHub-hosted Ubuntu. This verifies the workflow contracts within that commit's scope; it is not Netlify deployment evidence.

Real deployment begins only after an authorized operator supplies an authenticated Netlify context and deliberately links the intended disposable/reference site. Absence of a Netlify CLI, authenticated session, or `.netlify/state.json` link is a stop condition for external deployment—not permission to create an arbitrary site, reuse unknown credentials, or change DNS. Site creation, deployment, form verification, header inspection, and rollback evidence must refer to the same explicitly identified Netlify site.

Dependency checkpoint recorded 2026-08-24: PRs `#1`, `#2`, `#4`, and `#5` showed stale `npm ci` failures from branches created before the clean-install repair; PR `#3` had fresh green checks. Re-query rather than trusting this snapshot. PRs `#4` (`@types/node` 26) and `#5` (TypeScript 7) cross the repository's Node 24 and TypeScript 6 compatibility lines and must not be merged without a deliberate compatibility decision. PRs `#1`, `#2`, and `#3` are major GitHub Action updates requiring rebase and explicit review, not automatic merging.
