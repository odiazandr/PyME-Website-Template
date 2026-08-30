---
owner: docs/spec/deployment.md
authority: canonical
status: active
answers: ["How will websites be deployed?", "What owns production configuration?"]
---

# Deployment

The intended default flow is a private GitHub client repository to Netlify: pull request, required checks, Deploy Preview, review, merge to `main` after repository rules protect it, production-quality build, `dist/`, CDN, and client-owned custom domain.

Deployment belongs to the client repository, not to the canonical template repository. `PyME-Website-Template` may prove local build, CI, browser, and lifecycle contracts, but a live Netlify proof must use an explicitly authorized disposable or client repository/site pair. Do not link the template repository to a client Netlify project or present an unrelated Netlify site as example evidence.

The implemented `netlify.toml` runs `npm run quality`, publishes `dist/`, supplies stable security headers, and gives immutable caching only to hashed Astro assets. This is a verified local configuration contract, not evidence of a successful Netlify deployment. Deploy Previews remain the standard planned review surface; permanent branch deployments are optional. Production rollback uses a source revert or a prior Netlify deploy. DNS changes follow their runbook and preserve mail-related records.

The required status-check contexts are the job display names `Quality and contracts` and `Chromium and WebKit`, not the workflow names. An importable ruleset carrying them is `.github/rulesets/main-protection.json`; its reasoning is owned by `.github/rulesets/README.md`.

GitHub Actions separates deterministic quality from browser QA. `ci.yml` runs the locked install, memory contracts, development quality gate, and deterministic suite on pull requests and `main`. `browser-qa.yml` installs Chromium and WebKit on Ubuntu, runs the complete Playwright matrix, requires a report after successful execution, and retains any available report after failures. Both workflows use read-only repository permissions. Repository rules must be configured separately to make their checks mandatory.

`netlify.toml` runs the development gate because Netlify builds every Deploy Preview, including previews of work in progress. The strict gate therefore runs in CI instead: the `Client production gate` job in `ci.yml` reads `memory.toml` and runs `quality:production` only when the repository is in project mode, so the distribution template still previews while an adopted client repository gets automated enforcement. Passing the development gate remains no evidence of production readiness. An adopted repository adds `Client production gate` to its own required contexts; the committed ruleset carries only the contexts this template's own default branch enforces.

Repository control is enforced. Ruleset `main protection` is active on the default branch: a pull request is required, both status checks above must pass, the branch must be up to date, history stays linear, and force pushes and deletion are refused. The bypass list is empty by intent, so a repository administrator repairing a broken default branch must edit the ruleset deliberately rather than slip past it silently.

Do not restate that state from this document. It describes an external system that can change without any commit here, which is how the previous checkpoint in this position came to assert the opposite of the truth. Verify it instead with `npm run check:ruleset`, which compares the committed ruleset against what GitHub currently enforces and reports UNVERIFIED rather than passing when the API is unreachable.

The baseline remote evidence is commit `22f98bc015f062a53630f358bf687fb9710250cf`: [CI run 32750957058](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957058) and [Browser QA run 32750957034](https://github.com/odiazandr/PyME-Website-Template/actions/runs/32750957034) both completed successfully on GitHub-hosted Ubuntu. This verifies the workflow contracts within that commit's scope; it is not Netlify deployment evidence.

Real deployment begins only after an authorized operator supplies an authenticated Netlify context and deliberately links the intended disposable/reference site. Absence of a Netlify CLI, authenticated session, or `.netlify/state.json` link is a stop condition for external deployment—not permission to create an arbitrary site, reuse unknown credentials, or change DNS. Site creation, deployment, form verification, header inspection, and rollback evidence must refer to the same explicitly identified Netlify site.

## Provider verification

`npm run verify:deployment` is a read-only, external verification command. It requires `NETLIFY_AUTH_TOKEN` and either `NETLIFY_SITE_ID` or the explicit `.netlify/state.json` link. It compares the linked site's custom domain, published production revision, build command and publish directory, HTML form detection setting, registered forms, stored submissions, submission notification hooks, and live response headers against repository-owned configuration. It never creates sites, changes settings, sends a form, or deletes provider data.

It reports `PASSED`, `FAILED`, or `UNVERIFIED`: missing authentication, an unavailable API, an unknown provider field, or no stored verified submission are `UNVERIFIED`; a contradicted provider setting is `FAILED`. `--commit <revision>` declares the reviewed revision; otherwise the command reads `origin/main`. The command is intentionally not part of `quality` or `quality:production`, because provider availability and credentials are not deterministic repository inputs.

An email notification hook proves routing is configured, not that a real inbox received a message. Confirm inbox delivery and retention/deletion practice as manual launch evidence.
For client work, connect Netlify to the client GitHub repository so pushes and pull requests produce provider builds and previews. Manual CLI deploys are secondary evidence for isolated rehearsal or recovery, not the normal production path.

Automated dependency proposals are governed by two durable rules rather than a dated status snapshot. A proposal that crosses a declared compatibility line, such as a Node type definition ahead of the pinned Node major or a TypeScript release ahead of the documented Astro-compatible line, must not be merged without an explicit compatibility decision recorded in `docs/runbooks/maintenance.md`. A major GitHub Action update requires rebase, immutable-SHA verification, and the same review as any other major dependency.

Check status by querying the open pull requests, never by reading a recorded list from this document. Under the active ruleset every such branch must also be brought up to date before it can merge.
