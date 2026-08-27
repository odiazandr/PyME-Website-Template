# Adversarial repository validation — 2026-08-26

Third campaign. Scoped to the delta since campaign 2 (55 files, +6650 lines) and to
the newly gated path to the default branch. **No commits, pushes, or merges were
performed**, per instruction.

Companion files: `findings.json`, `failure-matrix.csv`, `campaign-ledger.json`,
`interpretation-divergence.md`, `monte-carlo-report.md`, `remediation-roadmap.md`,
`final-integrity.md`, and the machine-readable evidence alongside them.
`harness/` holds only what this campaign added; see its README.

---

## Executive summary

**The repository is materially harder to break than it was two campaigns ago, and
the remaining findings are about documentation and configuration record-keeping
rather than behaviour.** That is a real change in kind: campaign 1 found false
passes in the validator, campaign 2 found a client site publishing a placeholder
address in structured data, and this campaign found nothing that lets bad content
or a broken change reach the default branch.

The strongest evidence is a differential test rather than a frequency one. An
independent oracle was derived from the stated content contract and compared
against the gate's actual verdict across 80 sampled scenarios spanning eight
dimensions. **They agreed 80 out of 80, with zero crashes**, including the widened
scan reaching testimonial free text. Where campaign 2 measured how often the gate
passed, this measured whether the gate is *right*.

The second strongest is behavioural. A cold agent, given a realistic content task
and no hints, set `approvedForPublication: false` on both new records citing the
rule, refused all three production flags, refused the memory-mode switch, and
**refused to invent a postal code it had not been given** — rather than copying
`72000` from the neighbouring fixture. The contract is discoverable by the readers
it was written for.

**Two confirmed findings, one informational, three claims invalidated.** Highest
severity is low-medium. Both confirmed findings are record-keeping: the committed
ruleset file drifts from what GitHub enforces, and the deployment specification
still says the default branch is unprotected.

**Confidence is high for everything reachable without credentials, and there are
two specific things I could not test**, both stated in the failure matrix rather
than papered over: whether a direct push is actually rejected, and what the live
ruleset's bypass list contains.

Both confirmed findings were remediated after this campaign closed, in the commits
that became `86d0571` and `c94bf27` on the default branch. `findings.json` is the
register as written during discovery; `remediation-roadmap.md` records what was done.

## Findings

| ID | Finding | Severity | Status |
|---|---|---|---|
| C3-001 | Committed ruleset diverges from enforced config, undetected | Low-medium | Confirmed |
| C3-002 | `deployment.md` still records the default branch as unprotected | Low | Confirmed |
| C3-003 | Sample-value detection is a substring scan over free text | Informational | Plausible, by design |

**C3-001.** GitHub does not read `.github/rulesets/main-protection.json`; it is a
copy that must be imported, and the import added two `pull_request` parameters the
committed file never declared. The two drifted values are inert here — GitHub's
documentation states the extra-approval rule concerns unattributed Copilot pull
requests and *"has no effect if the ruleset already requires zero approvals"*,
which this one does. The finding is the precedent, not these values: a future
divergence in a parameter that mattered would be equally invisible. The drift
checker has since been implemented and merged as `.github/rulesets/check-drift.py`,
exposed as `npm run check:ruleset`. It was validated with a positive control
(passes against the real config) and a negative control (catches an injected
drift, including the job-name-versus-workflow-name mistake), and is deliberately
excluded from the deterministic gates because it depends on an external service.

**C3-002.** `docs/spec/deployment.md` line 17 records that GitHub reported `main`
as unprotected. That is now false. The same sentence instructs the reader to
re-query before acting and not to claim protection until GitHub reports it active,
which is good design and is why this is low rather than medium — but the headline
claim is inverted, and a hurried reader could conclude a direct push is acceptable.
Line 23 carries the same dated-snapshot pattern for dependency pull requests.

## Invalidated

- **An extra-approval deadlock on a single-maintainer repository.** This campaign's
  own hypothesis on discovering the drift. GitHub's documentation refutes it: the
  rule concerns how a pull request was opened, not commit trailers, and is inert at
  zero required approvals.
- **Dependabot pull requests will need a human approval.** From the merge-path
  agent. `required_approving_review_count` is 0; they need passing checks and an
  up-to-date branch, not an approval.
- **Full memory health is broken.** From this campaign's own Wave 0 oracle. It
  fails only inside the disposable sandbox, where `node_modules/.bin` does not
  resolve for nested npm scripts from a deep temporary path. In the canonical
  repository `python ops/memory_health.py` returns PASSED with build, test, and
  lint green. Environment artifact.

## What was tested and passed

Every workflow-change scenario **fails safe**: renaming a job, deleting a workflow,
or adding a `paths:` filter blocks future pull requests rather than admitting
unchecked code; renaming a workflow has no effect because the ruleset keys on job
display names. Neither workflow contains `continue-on-error`, `|| true`, or a soft
assertion — the two `if:` conditions guard a report assertion and artifact
retention, neither of which can mask a failed step.

All 13 memory-validator mutations from campaign 1 remain closed. The 32-case
initializer fuzzer still reports zero crashes and zero wrong acceptances after the
canonical-URL schema change. No case-only filename collisions and no
case-mismatched relative imports across 68 source files. `package-lock.json`
agrees with `package.json`.

The campaign-2 harness archived in `docs/audits/` ran successfully with only its
two documented variables rehydrated — the audit archive is genuinely reusable
rather than decorative.

## Not tested

Five cells, each for a stated reason rather than an oversight:

- **Whether a direct push to the default branch is actually rejected.** Requires a
  real push. `git push --dry-run` cannot answer it: dry-run negotiates but never
  sends the ref-update, so server-side rules are never asked. Deliberately not
  attempted — if the rules were not enforcing, the attempt itself would put a
  commit on the default branch through the exact gap being verified.
- **The live ruleset's `bypass_actors`.** Withheld from unauthenticated callers.
  Reading it needs an authenticated admin token, which was not handled.
- **A pull request actually being blocked.** Requires an open pull request.
- **Netlify response headers and form receipt**, and **DNS cutover** — no
  deployment and no domain exist.

## Method

Six cheap-agent invocations (`claude-haiku-4-5`), zero premium subagents, roughly
210 deterministic tool runs, 80 sampled scenarios, 32 fuzz cases, 5 disposable
sandboxes. Three agents died mid-wave on an account session limit and were retried
after it cleared; that is recorded in the ledger rather than hidden.

Deterministic tooling found both confirmed findings. Agents were most useful for
the behavioural probe and for surfacing the stale specification. As in campaign 2,
an agent-originated claim did not survive verification, and so did one of this
campaign's own hypotheses — which is the reason the confirmation step exists.

## Final integrity

Canonical repository byte-identical to the campaign baseline: 263 files, working
tree clean, `HEAD`/`main`/`origin/main` unchanged. No commits, pushes, or merges.
Network access was read-only GitHub API only. `memory health PASSED` and
`npm test exit 0` after the campaign. Seven sandboxes removed, four junctions
unlinked first, canonical `node_modules` verified intact before and after. No
cleanup remains.
