---
owner: docs/INDEX.md
authority: canonical
status: active
answers:
  - "Where is something documented?"
  - "What active project knowledge exists?"
---
# Documentation index

Pointers only; summaries belong to their canonical owners.

| Tier | File | Owns |
|---|---|---|
| T0 | `PROJECT.md` | Repository-wide invariants and routing |
| T1 | `docs/INDEX.md` | Knowledge map |
| T1 | `docs/GLOSSARY.md` | Project vocabulary |
| T2 | `docs/spec/memory-system.md` | Knowledge tiers, authority, ownership, and lifecycle |
| T2 | `docs/spec/active-working-set.md` | Task-scoped pointer cache and fallback |
| T2 | `docs/spec/portability.md` | Host independence and degraded operation |
| T2 | `docs/spec/frontmatter.md` | Knowledge-document metadata contract |
| T2 | `docs/spec/validation.md` | Template/project modes and validation results |
| T2 | `docs/spec/project-state.md` | Machine-readable implementation state and transitions |
| T2 | `docs/spec/product-scope.md` | Supported website classes and escalation boundary |
| T2 | `docs/spec/architecture.md` | Static-first technical architecture |
| T2 | `docs/spec/source-of-truth.md` | Implemented and planned ownership of website facts |
| T2 | `docs/spec/content-model.md` | Implemented business data and planned editorial domains |
| T2 | `docs/spec/site-archetypes.md` | Starting information-architecture recipes |
| T2 | `docs/spec/routing.md` | Public route and URL policy |
| T2 | `docs/spec/design-system.md` | Implemented design foundation and identity boundaries |
| T2 | `docs/spec/component-system.md` | Implemented UI, core, and section component taxonomy |
| T2 | `docs/spec/browser-support.md` | Browser classes, progressive enhancement, and polyfill policy |
| T2 | `docs/spec/media.md` | Image, font, and public-asset policy |
| T2 | `docs/spec/accessibility.md` | Accessibility target and QA contract |
| T2 | `docs/spec/performance.md` | Performance architecture and cost review |
| T2 | `docs/spec/seo.md` | Metadata, canonicalization, sitemap, and schema |
| T2 | `docs/spec/privacy.md` | Data minimization and privacy integration |
| T2 | `docs/spec/security.md` | Threat boundaries, CSP, headers, and secrets |
| T2 | `docs/spec/forms.md` | Progressive forms and data handling |
| T2 | `docs/spec/integrations.md` | Third-party integration review contract |
| T2 | `docs/spec/localization.md` | Locale and multilingual extension policy |
| T2 | `docs/spec/deployment.md` | GitHub-to-Netlify delivery contract |
| T2 | `docs/spec/website-validation.md` | Development and production quality gates |
| T2 | `docs/spec/template-versioning.md` | Template identity, SemVer, and migration |
| T2 | `docs/spec/ownership-boundary.md` | Project 1 and Project 2 separation |
| T2 | `docs/spec/repository-identity.md` | Canonical Git origin and upstream disconnection |
| T2 | `docs/runbooks/adopt-template.md` | Safe memory/template adoption |
| T2 | `docs/runbooks/memory-health.md` | Memory audit procedure |
| T2 | `docs/runbooks/active-working-set.md` | Working Set operating procedure |
| T2 | `docs/runbooks/create-client-site.md` | Client-repository initialization |
| T2 | `docs/runbooks/local-development.md` | Implemented local runtime workflow |
| T2 | `docs/runbooks/customize-brand.md` | Brand customization sequence |
| T2 | `docs/runbooks/populate-business-data.md` | Verified fact population |
| T2 | `docs/runbooks/add-page.md` | Page addition procedure |
| T2 | `docs/runbooks/add-service.md` | Service addition procedure |
| T2 | `docs/runbooks/add-location.md` | Location addition procedure |
| T2 | `docs/runbooks/add-form.md` | Form addition and privacy review |
| T2 | `docs/runbooks/add-integration.md` | Third-party integration procedure |
| T2 | `docs/runbooks/add-language.md` | Additional-language procedure |
| T2 | `docs/runbooks/manage-images.md` | Media intake and optimization |
| T2 | `docs/runbooks/review-accessibility.md` | Automated and manual accessibility QA |
| T2 | `docs/runbooks/review-seo.md` | Search readiness review |
| T2 | `docs/runbooks/dns-cutover.md` | Safe DNS change procedure |
| T2 | `docs/runbooks/launch.md` | Production launch sequence |
| T2 | `docs/runbooks/rollback.md` | Source, deploy, DNS, and integration recovery |
| T2 | `docs/runbooks/incident-response.md` | Proportionate incident handling |
| T2 | `docs/runbooks/maintenance.md` | Recurring health review |
| T2 | `docs/runbooks/template-upgrade.md` | Reviewed client migration |
| T2 | `docs/runbooks/handoff.md` | Client handoff boundary |
| T2 | `docs/explain/how-the-template-works.md` | Plain-language template model |
| T2 | `docs/explain/static-vs-dynamic.md` | Static-first reasoning |
| T2 | `docs/explain/how-deployment-works.md` | Plain-language delivery flow |
| T2 | `docs/explain/how-a-client-site-evolves.md` | Layered customization and extension |
| T3 | `docs/decisions/0001-repository-native-memory.md` | Why repository files own memory |
| T3 | `docs/decisions/0002-hard-memory-contracts.md` | Why memory rules are validated |
| T3 | `docs/decisions/0003-active-working-set.md` | Why relevance pointers are cached |
| T3 | `docs/decisions/0004-deterministic-ownership-key.md` | Why ownership uses normalized questions |
| T3 | `docs/decisions/0005-memory-validator-hardening.md` | Why memory validation uses explicit strict contracts |
| T3 | `docs/decisions/0006-machine-readable-project-state.md` | Machine-readable implementation evidence |
| T3 | `docs/decisions/0100-static-first-architecture.md` | Static-first selection |
| T3 | `docs/decisions/0101-astro-as-site-framework.md` | Astro selection |
| T3 | `docs/decisions/0102-plain-css-and-design-tokens.md` | Styling selection |
| T3 | `docs/decisions/0103-typescript-policy.md` | TypeScript compatibility policy |
| T3 | `docs/decisions/0104-netlify-as-default-host.md` | Default hosting selection |
| T3 | `docs/decisions/0105-one-repository-per-client.md` | Client isolation |
| T3 | `docs/decisions/0106-no-cms-by-default.md` | CMS exclusion from core |
| T3 | `docs/decisions/0107-no-backend-by-default.md` | Backend exclusion from core |
| T3 | `docs/decisions/0108-client-owned-domain.md` | Domain ownership policy |
| T3 | `docs/decisions/0109-independent-template-versioning.md` | Explicit migration model |
| T3 | `docs/decisions/0110-astro-csp.md` | CSP generation and response-header ownership |
| T3 | `docs/decisions/0111-file-driven-client-initialization.md` | Reviewed-input client initialization |
| T3 | `docs/decisions/0112-per-record-publication-approval.md` | Per-record content publication approval |

## Machinery and reserved paths

| Path | Purpose |
|---|---|
| `.agents/skills/` | Canonical reusable procedures; reserved in this phase |
| `.claude/skills/` | Derived adapters; reserved in this phase |
| `.qwen/skills/` | Derived adapters; reserved in this phase |
| `.memory/working-sets/` | Local task-scoped pointer caches |
| `.github/` | Implemented CI, browser QA, ownership, dependency maintenance, and contribution forms |
| `memory.toml` | Memory mode and configured checks |
| `ops/` | Deterministic memory-health tooling |
| `schemas/` | Public JSON contracts; reserved until implemented |
| `scripts/` | Implemented client initialization, data validation, and production validation |
| `tests/` | Implemented memory, data, route, serialization, security, artifact, production-gate, browser, and Axe verification |
| `src/` | Implemented Astro, data, design, routes, SEO, privacy, and form foundations |
| `docs/archive/` | Cold superseded material; inventory by path only |
