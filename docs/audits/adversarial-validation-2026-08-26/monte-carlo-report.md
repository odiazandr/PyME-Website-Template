# Sampling report — 2026-08-26

This campaign replaced frequency sampling with a **differential** design. Raw rows
are in `differential-content.json` and `differential-content.csv`; the sampler is
`harness/differential_content.py`.

## Why the design changed

The 2026-08-25 campaign sampled repository states and reported how often the gates
passed, conditioned on each dimension. That located risk — a defect value whose
pass rate matched its correct counterpart meant the gate was blind to it — but it
could not say whether the gate was *right*, only whether it was *sensitive*.

With the content contract now specified precisely enough to re-derive, a stronger
question became available: does the gate's verdict match a verdict computed
independently from the specification? Every disagreement is a defect in one of the
two, and there is no interpretation step in between.

## Variables

| Dimension | Values |
|---|---|
| `loc_approved` | true, false |
| `loc_hours` | normal_week, all_closed, one_day |
| `loc_text` | verified, placeholder_street |
| `svc_approved` | true, false |
| `svc_text` | verified, placeholder_desc |
| `testimonial` | none, clean, placeholder_quote |
| `canonical` | origin, netlify |
| `approvals` | all_true, one_false |

288 combinations. Every scenario pins memory mode to `project` and supplies a
verified business identity and approved privacy text, so sampling explores only
what the content contract itself governs.

## Method

For each sample: apply the state to a disposable copy, run
`node scripts/validate-production.ts`, and collect the finding codes it emits.
Separately compute the expected code set from the documented contract — records
lacking approval produce `CONTENT_REVIEW_REQUIRED`, an approved location closed
all week produces `LOCATION_NEVER_OPEN`, registered placeholder wording anywhere
in the scanned domains produces `SAMPLE_VALUE`, a provider domain produces
`PROVIDER_CANONICAL`, a withdrawn flag produces `PRODUCTION_APPROVAL_REQUIRED`.
Compare the two sets exactly, and treat a Node stack trace as its own failure
class rather than as a rejection.

## Result

Seed `20260826`, 80 samples.

| Measure | Result |
|---|---|
| Gate agreed with the independent oracle | **80 / 80** |
| Crashes | **0** |
| Disagreements | none |

The agreement includes the cases that most easily go wrong: a testimonial quote
containing registered placeholder wording correctly produced `SAMPLE_VALUE`,
confirming the widened scan reaches free text in domains beyond business identity;
and an approved location open on exactly one day correctly did *not* produce
`LOCATION_NEVER_OPEN`, confirming the rule tests "never open" rather than
"not open enough".

## Limitations

80 of 288 combinations were sampled, so this is not exhaustive. A single seed was
used. The oracle encodes the contract *as documented*; if the documentation and
the intent diverge, both sides of this comparison would be wrong together and the
test would still report agreement — this measures internal consistency, not
whether the contract is the right contract. Nothing here exercises the built
output, which is covered separately by the artifact and browser suites.

## Recommended for deterministic regression

None newly. Every behaviour sampled here is already covered by the
mutation-resistance suite in `tests/production/validation.test.ts`, which is why
the differential found no disagreements. The sampler's value is as a check on that
suite's completeness, and it should be re-run whenever the content contract gains
a rule.
