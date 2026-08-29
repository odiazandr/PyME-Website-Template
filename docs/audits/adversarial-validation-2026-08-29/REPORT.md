# Adversarial validation campaign 5

Date: 2026-08-28 through 2026-08-29  
Repository commit: `87581248b505a3217ad496f813609075f5ae5bba`  
Canonical branch: `fix/campaign-4-remediation`  
Seed: `20260828`

## Executive summary

The repository is robust in its memory-contract layer, reproducible Node 24 installation, ordinary static build, current dependency audit, route/artifact baseline, and Chromium browser baseline. It is not yet safe to treat a green strict production gate as proof that a client site is publication-ready.

The campaign confirmed eight unique weaknesses: one High, three Medium, and four Low. No Critical finding, credential leak, dependency vulnerability, repository corruption, or demonstrated executable cross-site scripting was found. One previously accepted concurrency finding was rediscovered and classified as a duplicate rather than counted again.

The most important failure is `C5-001`: an initialized, approved project can pass all fourteen strict production steps while the built site still says it is a reference, is not authorized for publication, and contains information pending client verification. The prior content-domain placeholder weakness was remediated; the remaining bypass comes from unconditional component/page copy and a narrow built-output sentinel list.

The next most important weaknesses are non-transactional initializer writes (`C5-002`), public-link schemas that accept and emit `javascript:` URLs while the strict gate stays green (`C5-003`), and the absence of a test protecting the composition of the production-gate package script (`C5-004`). The current CSP materially mitigates execution of the tested `javascript:` link, so this is reported as a definite reliability failure and a latent security sink, not as confirmed XSS.

Overall confidence is high for the confirmed local behaviors and medium for cross-platform, provider, deployment, and recovery behavior. No live Netlify site, DNS record, authenticated provider, real form endpoint, credential, production database, or external write was used. macOS, current Ubuntu WebKit, Firefox, live response headers, provider-side form storage, restore/rollback, cache corruption, disk exhaustion, and non-Node-24 upgrade/downgrade paths remain untested.

## Evidence-based system map

| Layer | Declared owner / source of truth | Enforced by | Tested here |
| --- | --- | --- | --- |
| Agent routing and repository invariants | `PROJECT.md`, then `docs/INDEX.md` | memory health and contributor behavior | Passed baseline; interpretation divergence remains around limited-context entry points |
| Runtime/toolchain | `.nvmrc`, `.npmrc`, `package.json`, `package-lock.json` | npm engine strictness, locked install, CI | Offline clean install, dependency tree, build, type-check, audit |
| Client initialization | `scripts/init-client.ts`, client-input schema | Zod and mode guard | Valid/invalid fuzzing, permission fault, concurrency |
| Business facts | `src/data/`, `src/config/site.ts`, schemas | data/project/production validators | Negative content sampling, URL mutation, initialized lifecycle |
| Static presentation | Astro pages/components | Astro build and artifact checks | Chromium matrix, partial WebKit, output scans |
| Routing/artifacts | navigation/route registries, sitemap, robots, public manifest | route, artifact, link and dist validators | Baseline plus missing-index directory mutation |
| Production readiness | `package.json` `quality:production` | ordered command chain and project-mode CI job | Fourteen-step lifecycle and no-op script mutation |
| External boundary | Netlify static hosting/forms, GitHub, DNS | documented operator authorization and provider controls | No external mutation; GitHub ruleset drift read-only check only |

### Guarantees, implications, enforcement, and inference

- Explicit guarantee: facts must be verified; secrets/private operational data must not enter public or committed data; production validation is part of done.
- Documentation implication: passing `quality:production` represents a strict client-production readiness decision.
- Implementation enforcement: schemas, publication approvals, privacy/canonical checks, build, artifact contracts, link scan, and bounded output sentinels.
- Test enforcement: strong negative coverage in memory contracts and content approval; weaker coverage of package-script composition, initializer filesystem failures, public URL schemes, and WebKit request representations.
- Campaign inference: the static-first architecture limits remote attack surface, but the reliability of launch assurance depends heavily on complete sentinel ownership and tests that protect the orchestration layer.

## Baseline and test oracle

- `npm ci --ignore-scripts --offline`: passed; 286 packages restored from the lockfile.
- `npm ls --all`: passed.
- `python ops/memory_health.py --scope contracts`: passed.
- `npm run quality`: passed.
- `npm test`: passed: memory 51 (one platform-dependent symlink skip), data 12, site 30, security 8, artifacts 7, production 28.
- `npx tsc --noEmit`: passed.
- Chromium browser matrix: 39/39 passed across desktop, mobile, and 320x568 narrow projects.
- Canonical-template `quality:production`: failed as designed because the distribution repository is not a client project.
- Initialized disposable lifecycle: all 14 production steps passed.
- `npm audit --offline` and a current registry-backed `npm audit --json`: zero known vulnerabilities in every severity bucket.
- Current-tree and full-history high-confidence credential-pattern scans: no matches. This is not a substitute for a configured secret-scanning tool.
- Git object integrity: canonical `git fsck` passed. A disposable clone later had an orphaned remote-HEAD reference after deliberate remote removal; the canonical repository did not.
- Node built-in coverage over 77 TypeScript tests: 93.04% lines, 87.38% branches, 94.03% functions. The initializer's actual sequential write block was uncovered.

The oracle treated expected rejection as success for malformed/project-readiness scenarios, distinguished product failures from test-harness failures, and did not promote a security hypothesis without executable evidence.

## Confirmed and supported findings

| ID | Severity | Status | Title |
| --- | --- | --- | --- |
| C5-001 | High | Confirmed | Strict production gate publishes residual reference and not-authorized copy |
| C5-002 | Medium | Confirmed | Initializer filesystem failure leaves a mixed canonical state |
| C5-003 | Medium | Confirmed | Public URL fields accept and emit unsafe schemes while production validation passes |
| C5-004 | Medium | Confirmed | Tests do not protect production-gate script composition |
| C5-005 | Low | Confirmed | Link validator accepts a directory that has no index artifact |
| C5-006 | Low | Confirmed | WebKit form assertion reports a missing payload although the POST body is correct |
| C5-007 | Low | Strongly supported | Windows WebKit documentation is stale and the iPad skip-link oracle is non-portable |
| C5-008 | Low | Confirmed | Repository-wide secret scan is explicitly not configured |
| C5-D01 | Low | Duplicate | Concurrent initializer race duplicates accepted finding AV2-006 |

The complete reproduction details, root causes, evidence, and regression proposals are in `findings.json` and `regression-tests.md`.

## Important falsifications and passes

- No current dependency vulnerability was reported by npm audit.
- No credential-like value was found in the scoped current-tree or history scans.
- The WebKit form failure did not demonstrate a broken form: retained trace bytes contained the complete expected form body and the thank-you route rendered.
- The WebKit skip-link failure did not demonstrate that Enter fails to move focus: the test stopped at synthetic Tab focus before attempting Enter.
- The emitted `javascript:` link was not executed. Current CSP uses `script-src 'self'` plus hashes without `unsafe-inline`, which should block it in conforming browsers; runtime CSP enforcement was intentionally not probed.
- The 32-case initializer fuzzer produced zero crashes and zero accept/reject disagreements for the cases with an explicit oracle.
- The 32-case differential content campaign agreed with its independently derived oracle in every case.
- Canonical Git integrity and the pre-existing working tree remained intact.

## Areas tested

Fresh/offline install, lockfile resolution, Node/runtime pinning, build, type-check, deterministic suites, memory contracts, project/production validators, client initialization, partial filesystem failure, concurrency, URL scheme validation, output sentinels, route/link resolution, package-script mutation, current dependency audit, high-confidence secret signatures, Git integrity, ruleset drift, Chromium browser behavior, Windows WebKit evidence behavior, limited-context agent interpretation, seeded configuration/content combinations, and prior-finding deduplication.

## Areas not tested or only partially tested

- Live Netlify deployment, response headers, provider-side form capture, rollback, DNS, and authenticated GitHub writes.
- Real production data, credentials, payments, messages, databases, migrations, or infrastructure; none exist in the tested static default and none were introduced.
- Current Ubuntu/macOS Safari, real iPad hardware keyboard behavior, Firefox, assistive-technology manual review.
- Cache corruption, partial network responses, disk-full faults, process kill at every write boundary, sustained resource exhaustion, and filesystem case behavior on Linux/macOS.
- Runtime/dependency upgrades or downgrades outside the declared Node 24 line.
- A comprehensive secret scanner such as gitleaks or TruffleHog; those tools were unavailable and the configured memory check is empty.
- Runtime proof of CSP handling for unsafe links. The review stopped at schema, artifact, and policy analysis to avoid unnecessary exploit-like behavior.

## Confidence and uncertainty

Confidence is high that the local confirmed findings reproduce on the recorded Windows/Node 24 environment. Confidence is medium for operational readiness because external provider behavior was deliberately excluded. The largest uncertainty is the difference between static artifacts and their deployed response headers/provider integrations, followed by cross-platform WebKit behavior and recovery under abrupt process termination.

## Deliverables

- `campaign-ledger.json` — bounded resource and execution ledger.
- `findings.json` — machine-readable register.
- `failure-matrix.csv` — component/failure-class coverage.
- `interpretation-divergence.md` — independent model differences.
- `monte-carlo-report.md` plus raw JSON/CSV scenario records.
- `regression-tests.md` — minimal failing-before-fix test designs.
- `remediation-roadmap.md` — ordered containment and hardening plan.
- `final-integrity.md` — canonical-state and cleanup proof.

