---
owner: docs/spec/website-validation.md
authority: canonical
status: active
answers: ["Which checks gate development and production?", "What must built-output validation inspect?"]
---
# Website validation

## Implemented gates

`npm run quality` is the template-development gate. It checks formatting, Astro diagnostics, data schemas, security configuration, builds the reference site, and verifies its artifact contract.

`npm run quality:production` is the strict client-production gate. It requires valid memory contracts, all static checks, valid navigation, `project` memory mode, explicit recorded approval of business facts, domain ownership, and privacy text, non-sample client identity, a non-provider HTTPS canonical domain, approved privacy content, no unresolved markers, reviewed public-asset sizes, a successful clean build, passing artifact contracts, required artifacts, a schema-valid public manifest, matching canonical values, valid robots output, resolvable internal links constrained to `dist/`, and no forbidden sample/development sentinels in `dist/`.

The canonical template intentionally fails `quality:production`: it remains in template mode and contains clearly identified sample facts and unapproved reference legal text. Passing the development gate must never be interpreted as production approval. A future client initializer replaces those values and activates project mode.

The approval flags are repository attestations, not cryptographic or legal proof. They may be set only after the applicable human or operational verification has occurred; an agent may not self-authorize them. Automated validation deliberately does not pretend it can determine whether business claims are true, a party owns a domain, or legal language is sufficient.

Production validation inspects `dist/`, not source alone. The output scan is a bounded sanity layer, not comprehensive secret scanning. Browser QA is a separate implemented evidence layer for critical routes, navigation, forms, 404 behavior, CTAs, keyboard interaction, responsive overflow, and automated accessibility violations. Smoke tests retain the configured CSP; Axe tests use a test-local CSP bypass only to inject the scanner. Configured WebKit execution remains unverified until a supported host runs it.

## Command ownership

The individual commands are exposed for diagnosis: `validate:project`, `validate:production`, `check:placeholders`, `check:assets`, `verify:dist`, `check:links`, and `check:public-output`. `quality:production` owns their required order and stops at the first failed gate.
