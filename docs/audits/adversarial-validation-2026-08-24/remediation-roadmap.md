# Remediation roadmap

## Immediate containment

1. Do not use `MEMORY HEALTH: PASSED` as proof that all `memory.toml` checks or project-mode rules passed.
2. Keep `mode = "template"` until placeholder syntax and scan-scope semantics are corrected and regression-tested.
3. Treat build, lint, secret scanning, runtime, launch, and deployment as explicitly unverified.
4. Commit the initial repository soon so the current untracked foundation has recoverable history.

## High-priority fixes

1. Replace presence-only config/frontmatter checks with explicit schemas for mode, authority, status, and answers.
2. Parse the index table and require exactly one row per active document plus failure for stale rows.
3. Define active-document discovery recursively and document directory/extension exemptions.
4. Separate placeholder declarations/allowlists from unresolved placeholder instances and define scanned paths.
5. Execute or explicitly report every configured check.
6. Add controlled error handling for missing files, invalid TOML, invalid encoding, and permission failures.

## Documentation corrections

1. Add a concrete private vulnerability-reporting channel before public use.
2. Define the Python version required by memory tooling.
3. Define whether machinery READMEs under `docs/` require frontmatter/index entries.
4. Assign canonical future storage for Site ID, social accounts, page SEO metadata, and general legal documents.
5. Convert launch and rollback assumptions into evidence-bearing checklists when those phases begin.

## Test improvements

1. Introduce fixture-root injection instead of fixed module globals.
2. Add negative tests for every validator contract.
3. Test CLI exit codes and structured output.
4. Add Unicode normalization cases relevant to Spanish.
5. Add mutation tests proving each regression test fails when its protected check is removed.

## Architecture and long-term hardening

1. Create a machine-readable repository/phase capability inventory so planned and implemented controls cannot be confused.
2. Validate the sole Git origin before publish/deploy workflows.
3. Define external provider permissions, evidence retention, and recovery ownership before connecting Project 2 or production services.
4. Repeat this campaign after runtime, schemas, CI, and Netlify configuration exist; current results do not cover those layers.

Order: validator truthfulness → regression suite → ownership gaps → operational evidence → runtime/deployment adversarial testing.
