# Adversarial repository validation — 2026-08-25

Campaign against the working tree at `4bff8ed`, including the then-uncommitted
Phase 12 client-initializer work. Followed by a remediation pass in the same
session; every finding below records what happened to it.

Companion documents: `findings.json` (machine-readable register),
`failure-matrix.csv`, `campaign-ledger.json`, `interpretation-divergence.md`,
`monte-carlo-report.md`, `remediation-roadmap.md`, `final-integrity.md`.
Re-runnable harnesses are under `harness/`.

---

## Executive summary

The 2026-08-24 campaign hardened the memory layer. All thirteen of its findings
were re-tested here and remain closed. The business-content layer built
afterwards had not received the same treatment, and that was the campaign's
central result:

> A client website passed all fourteen steps of `npm run quality:production`
> while publishing a street address reading "Dirección pendiente", a featured
> service described as "content pending replacement with verified information",
> and business hours showing closed seven days a week.

The placeholder address reached schema.org `PostalAddress` structured data, so
the false fact was machine-readable business data, not merely visible copy. The
locality was inherited from the template fixture regardless of where the client
actually operates.

Two independent defects compounded to produce it. `scripts/validate-production.ts`
scanned only `{ business, site }`, and its sample-value list did not contain the
wording the template ships in the unscanned domains. Closing either alone would
have left the failure reachable.

**Seven findings: six confirmed, one plausible. Five have been remediated, one
accepted, one deferred.** Three agent claims were retracted after verification,
including one raised as critical. Those retractions are reported in full, because
a campaign that reports only what it confirmed is not honest about its own error
rate.

## Findings and outcomes

| ID | Finding | Severity | Outcome |
|---|---|---|---|
| AV2-001 | Full production gate passes on placeholder business content, including structured data | High | **Remediated** |
| AV2-002 | Empty navigation passes every source gate; only browser QA catches it | Low-medium | **Remediated** |
| AV2-003 | Forced re-initialization silently reissues the stable site identity | Medium | **Remediated** |
| AV2-004 | Canonical URL accepts embedded credentials, which reach the public manifest | Medium | **Remediated** |
| AV2-005 | Template version drift has no standing gate | Low | **Remediated** |
| AV2-006 | The already-initialized guard has a time-of-check to time-of-use race | Low | Accepted |
| AV2-007 | Recovery runbooks state principles rather than procedures | Medium at launch | Deferred |

Full detail, reproduction commands, and per-finding remediation evidence are in
`findings.json`.

## Remediation approach

Recorded as `docs/decisions/0112-per-record-publication-approval.md`.

The decisive observation was that `src/schemas/team.ts` and
`src/schemas/testimonial.ts` already required `approvedForPublication`, while
`location.ts` and `service.ts` did not — and the two skipped domains were exactly
the two that ship placeholder text and leak into production. This was never an
incomplete string list; it was an existing structural pattern applied
inconsistently.

Extending the literal sample list was rejected as the primary fix. That
hand-maintained-list pattern has now failed twice in this repository, once in the
memory validator and once here. A `z.strictObject` field cannot be forgotten; a
list can always fall behind.

The distinction the repository had conflated: whether a business claim is *true*
is undecidable and correctly delegated to human attestation, which
`docs/spec/website-validation.md` states explicitly and which this campaign
therefore did **not** treat as a defect. Whether content is still *literally the
template's* is trivially decidable, and should never have depended on four
hand-typed literals. Structural approval is the primary layer; string detection
remains as an independent second layer for the case where an operator sets a flag
but leaves the text unchanged.

## Verification after remediation

Re-running the campaign's own harnesses against the changed code:

| Attack | Before | After |
|---|---|---|
| Placeholder content through the full production gate | 14/14 steps passed | Rejected by two independent layers |
| `--force` re-initialization | New UUID minted silently | Identity preserved, source reported |
| Credentials in canonical URL | Written to the public manifest | Rejected cleanly |
| Empty navigation | Passed every source gate | `NAVIGATION_EMPTY` |
| Template version drift | No gate at all | `TEMPLATE_VERSION_MISMATCH` |

A genuinely completed client site still passes all fourteen production steps, so
the bad path was blocked without blocking the good one.

The re-run also caught a regression introduced by the remediation itself: the
stricter canonical-URL schema initially threw an uncaught `ZodError` instead of a
structured finding, breaking the zero-crash property the fuzzer had established.
Giving the rule a single owner shared by the site and input contracts fixed it,
and the 32-case fuzzer returned to zero crashes and zero wrong acceptances.

Final state: `npm run quality` exits 0, 69 tests pass, 13 browser tests pass, all
13 prior-campaign memory mutations remain closed, and the distribution template is
still correctly rejected by the production gate.

## Method and honesty notes

Ten cheap agents (`claude-haiku-4-5`) across five waves, zero premium subagents,
roughly 800 deterministic tool runs, 160 Monte Carlo scenarios, 32 fuzz cases, and
15 disposable sandboxes. The canonical repository was never mutated during
discovery; integrity was verified by full re-hash before and after.

Deterministic mutation testing found the high-severity finding. Agents were most
valuable for interpretation divergence and for the falsification pass — one of
which surfaced that a limitation reported early in the campaign was wrong.

**Mid-campaign correction.** `astro build`, `astro check`, and Playwright were
reported blocked by Windows Application Control during Wave 0 and treated as
untestable. A Wave 5 falsification agent returned built-output evidence that
should not have been obtainable. Direct re-verification showed the block was
transient: Windows had been withholding a reputation verdict on Astro's unsigned
native binding. The full production sequence, built output, structured data, and
browser QA were then exercised, untested failure-matrix cells fell from nine to
four, and AV2-001 was upgraded from partly-inferred to confirmed end to end.
