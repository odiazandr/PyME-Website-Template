# Interpretation-divergence report

## Method

Six independent cheap-agent interpretations were preserved before synthesis. Each agent received a narrow entry point: README-only, architecture-only, tests-first, root-routing/new-agent, operator/runbook, or security-review evidence. Conclusions from earlier agents were not shown to later discovery agents. Plausibility was assessed against the complete repository only after all six returned.

## Divergences

| Dimension | Independent interpretations | Text/structure causing the difference | Plausible action and failure | Clarification needed |
| --- | --- | --- | --- | --- |
| Purpose | README-only readers saw a near-deployable PyME site foundation; source/test readers saw a distribution template that intentionally fails production readiness until initialized and approved. | The product framing is prominent, while the template/project mode distinction and strict gate live deeper in specs and `memory.toml`. | A contributor deploys the reference artifact or treats development quality as launch approval. | Put the template/project lifecycle and explicit non-production default near the first setup/deploy instructions. |
| Architecture | Architecture-only readers correctly found static Astro and no application server, but could not determine the exact form/provider contract, effective response-header owner, or which browser behaviors were verified. | `docs/spec/architecture.md` states the static boundary; form, CSP, browser, and deploy evidence are split across other owners. | An agent adds server code unnecessarily, assumes provider behavior, or claims header enforcement from source metadata alone. | Add a small cross-owner trust-boundary map linking forms, security, browser support, and deployment owners. |
| Ownership | Root-routed agents stopped and used `docs/INDEX.md`; README-only and test-first agents were more likely to treat nearby tests/examples as owner documents. | `AGENTS.md` is intentionally only a pointer; limited-context tasks that omit it lose the route to canonical ownership. | An agent modifies a test literal or example instead of the owning configuration/spec, creating duplicate state. | Preserve the pointer design, but repeat only a non-policy link to `PROJECT.md`/`docs/INDEX.md` from the README contributor entry point. |
| Sources of truth | Source-first agents treated schemas/config as truth; tests-first agents inferred literal route lists and current fixtures were invariants; docs-first agents treated navigation and package scripts as owners. | Structural owners and redundant literal assertions coexist. | A sanctioned route/config change breaks CI, or a contributor changes tests to match a defect. | Convert literal tests to structural contracts and label fixture assertions as template-only where unavoidable. |
| Execution order | Some agents equated `npm test` or `npm run quality` with complete verification; production-spec readers distinguished the fourteen-step `quality:production` chain. | Similar command names, separate development/production purposes, and multiple runbook/spec locations. | A green development suite is reported as production-ready. | Show the command hierarchy once as a compact table; test the owner script composition. |
| Configuration | Architecture/source readers viewed navigation as configurable; tests-first readers saw fixed Spanish routes. Operator readers were unsure which fields initialization owns versus which require later approval. | `navigation.ts` is called an owner, while tests historically contain literals; initializer deliberately leaves publication/legal work outstanding. | An adopter follows configuration docs and gets a blocked build, or assumes initialization completes launch approval. | Document post-initialization outstanding owners next to initializer output and keep tests data-derived. |
| Recovery | Operator agents agreed on principles—contain, restore known-good state, verify—but could not produce provider-specific commands, evidence locations, or decision thresholds. | Runbooks are deliberately provider-neutral and principle-based. | Under incident pressure an operator improvises rollback, cannot prove which deploy/DNS state is restored, or destroys evidence. | Add authorized, provider-specific appendices when a real client environment exists; include evidence capture and abort conditions. |
| Security boundary | Security readers disagreed on whether CSP was a build artifact, meta policy, or deploy response-header guarantee; provider forms were also interpreted as either local behavior or external storage. | Security, deployment, layout, and browser tests each own only one part of the boundary. | A reviewer overclaims XSS mitigation or form retention without checking deployed headers/provider behavior. | Explicitly separate source policy, built meta policy, deployed response headers, and provider processing evidence. |
| Browser evidence | Documentation said Windows WebKit could not launch; retained current traces proved it did. Tests then appeared to show product failures until trace bytes and assertion order were inspected. | Stale environment note plus raw test pass/fail summaries without oracle limitations. | A contributor changes working form/focus code to satisfy a lossy or non-portable test. | Scope browser claims by commit/host and record whether a failure is product, harness, or environment evidence. |

## Fresh-agent behavior

The agent given only repository entry instructions correctly read `PROJECT.md`, then routed through `docs/INDEX.md`, distinguished a hypothetical request from an implemented requirement, and stopped at an ownership boundary. This was a pass. Limited-context agents denied those files predictably formed incomplete but competent models; the risk is context omission, not nonsensical interpretation.

The most consequential plausible misreadings were:

1. `npm run quality` means production-ready.
2. Initialization replaces/approves all public content.
3. Passing browser tests proves provider-side form capture.
4. A CSP artifact proves the same policy is retained by every deployment.
5. Tests containing literal fixtures own those product choices.

None of these should be treated as user incompetence; each follows from locally reasonable evidence viewed without the repository's complete routing model.

