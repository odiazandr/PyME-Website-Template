---
owner: docs/spec/website-validation.md
authority: canonical
status: active
answers: ["Which checks gate development and production?", "What must built-output validation inspect?"]
---
# Website validation

## Implemented gates

`npm run quality` is the template-development gate. It checks formatting, Astro diagnostics, data schemas, security configuration, builds the reference site, and verifies its artifact contract.

`npm run quality:production` is the strict client-production gate. It requires valid memory contracts, all static checks, non-empty navigation whose routes resolve, a recorded template version matching `package.json`, `project` memory mode, per-record publication approval for every location and service, explicit recorded approval of business facts, domain ownership, and privacy text, non-sample client identity, a non-provider HTTPS canonical domain, approved privacy content, no unresolved markers, reviewed public-asset sizes, a successful clean build, passing artifact contracts, required artifacts, a schema-valid public manifest, matching canonical values, valid robots output, resolvable internal links constrained to `dist/`, and no forbidden sample/development sentinels in `dist/`.

Production validation scans every canonical data domain, not business identity alone. A domain absent from that scan is a domain whose unreplaced reference content can reach a client's public website and its structured data.

The canonical template intentionally fails `quality:production`: it remains in template mode, its reference location and service are not approved for publication, and it contains clearly identified sample facts and unapproved reference legal text. Passing the development gate must never be interpreted as production approval. `npm run init:client` replaces those values and activates project mode; it deliberately leaves the approval flags and privacy notice outstanding because no agent may self-authorize them.

The approval flags are repository attestations, not cryptographic or legal proof. They may be set only after the applicable human or operational verification has occurred; an agent may not self-authorize them. Automated validation deliberately does not pretend it can determine whether business claims are true, a party owns a domain, or legal language is sufficient.

Production validation inspects `dist/`, not source alone. The output scan is a bounded sanity layer, not comprehensive secret scanning. Browser QA is a separate implemented evidence layer for critical routes, navigation, forms, 404 behavior, CTAs, keyboard interaction, responsive overflow, and automated accessibility violations. Smoke tests retain the configured CSP; Axe tests use a test-local CSP bypass only to inject the scanner. Configured WebKit execution remains unverified until a supported host runs it.

## Command ownership

The individual commands are exposed for diagnosis: `validate:project`, `validate:production`, `check:placeholders`, `check:assets`, `verify:dist`, `check:links`, and `check:public-output`. `quality:production` owns their required order and stops at the first failed gate.

A command whose entry module imports the canonical data barrel installs `scripts/lib/data-guard.ts` through `node --import`. The barrel parses every domain at module scope, so a schema violation would otherwise surface as an uncaught error before the command's own code runs. The guard reports the offending field path and expected type in the same shape `validate:data` uses, because a command exposed for diagnosis must diagnose rather than emit a stack trace.
