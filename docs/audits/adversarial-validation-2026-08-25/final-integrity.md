# Final integrity check — 2026-08-25

The campaign ran in two phases with different integrity expectations. During
**discovery**, the canonical repository was read-only and was verified unchanged.
During **remediation**, it was deliberately modified to fix what discovery found.

## Discovery phase — canonical repository unmodified

- Baseline recorded before any experiment: 238 files hashed, manifest SHA-256
  `1615ba2e50dbc104a1449b1be906a2bf2d2cd367285c622a8bfd970266d73a61`,
  `HEAD` = `4bff8ed9912d5fee4a263060648abfa232bb1c50`.
- Verified mid-campaign and again at the end of discovery by full re-hash:
  **byte-identical to baseline**.
- `git status --porcelain` identical to baseline throughout, so the user's
  pre-existing uncommitted work was preserved untouched.
- Files created or modified in the canonical repository during discovery: **none**.

All experiments ran in disposable copies produced by `harness/mksandbox.sh`:
15 sandboxes, each a `tar` copy of the working tree with a directory junction to
the canonical `node_modules`. The junction was never written through.

## Remediation phase — intentional changes

Twenty-five files modified and five added, all inside the repository, all
reviewed. Summarised in `remediation-roadmap.md` and recorded in
`docs/decisions/0112-per-record-publication-approval.md` and the changelog.

No history was rewritten. One factual correction was made to ADR 0111, which was
still uncommitted at the time and therefore a draft rather than a decision of
record; the correction is noted in the roadmap.

## Actions never taken, in either phase

- No network access of any kind.
- No push, no tag, no publish, no deploy.
- No Netlify site created, linked, or contacted.
- No DNS record inspected or changed.
- No credential read, written, rotated, or transmitted.
- No production system touched. None exists.
- No destructive operation against anything outside a disposable sandbox.

## Secrets

No secret, credential, token, or private operational value appears in any artifact
in this directory. The only credential-shaped string anywhere in the evidence is
the synthetic fuzz input `admin:hunter2`, invented for this campaign to prove that
a URL carrying userinfo could reach the public manifest. It corresponds to nothing.

`findings.json`, `campaign-ledger.json`, `REPORT.md`, and this file match a
keyword scan for `password|secret|token|api[_-]?key` only because they discuss that
finding.

## Final repository state

| Check | Result |
|---|---|
| `python ops/memory_health.py --scope contracts` | PASSED |
| `npm run quality` | exit 0 |
| `npm test` | 69 tests, 0 failures |
| Browser QA, desktop chromium | 13 passed |
| Prior-campaign memory mutations | 13 of 13 still closed |
| `node scripts/validate-production.ts` | correctly rejects the distribution template |

## Disposable artifacts

The 19 disposable sandboxes outside the repository — 442 MB, including two full
`node_modules` copies — were removed after these artifacts were archived. Their
17 directory junctions were unlinked first, as reparse points, so deletion could
not follow them into the canonical `node_modules`; that directory was verified
intact immediately before and after. A small evidence folder remains in the
session scratchpad and needs no action, since everything it holds is duplicated
here. Everything needed to reproduce the campaign is in this directory:
the harnesses under `harness/`, the machine-readable results alongside them, and
the console output for both conditioned Monte Carlo passes.

Regenerable working-tree clutter was also cleared: an empty `.ci-diagnostic-logs/`,
`test-results/`, and all `__pycache__` directories. `dist/`, `.astro/`, and
`node_modules/` remain, being live build output, Astro's type cache, and installed
dependencies respectively.

**No cleanup remains.**
