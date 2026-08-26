# Monte Carlo report — 2026-08-25

Three seeded runs. Raw rows in `monte-carlo-results.json` / `.csv` (uniform) and
`monte-carlo-results-conditioned-after.json` (post-remediation). Console output
for both conditioned passes is preserved in `monte-carlo-conditioned-before.txt`
and `monte-carlo-conditioned-after.txt`. The sampler is `harness/montecarlo.py`.

## Variables

| Dimension | Values |
|---|---|
| `mode` | template, project, bogus, missing |
| `identity` | client, sample |
| `canonical` | client_domain, netlify_app, example_com |
| `approvals` | all_true, partial, all_false |
| `privacy` | approved, reference_instruction |
| `content` | verified, placeholder_retained, empty_collections |
| `navigation` | intact, empty, dangling |
| `template_version` | matching, drifted |

2,592 combinations. Each sample is applied to a disposable copy and evaluated by
four source gates: memory contracts, `validate-data`, `validate-project`,
`validate-production`.

## Run 1 — uniform, seed 20260825, n=100

**0% all-pass, 0 crashes.** The all-pass corner has probability about 1/144 under
a uniform prior, so roughly 0.7 hits were expected and none observed.

This run is informative about signature distribution and crash-freedom and
uninformative about the conditional questions that matter. It is reported rather
than discarded because the sampling-design limitation is itself worth recording:
a uniform prior over independent failure dimensions spends nearly all its samples
in the region where something is already broken.

## Run 2 — conditioned, seed 20260826, n=60, before remediation

Pins every dimension an operator following the runbook would already have
satisfied (`mode=project`, client identity, client domain, all approvals true,
privacy approved) and samples only what the gates claim to protect afterwards.
This is importance sampling, not a uniform prior; the figures are **not**
production probabilities.

| Dimension | Value | n | P(all gates pass) |
|---|---|---|---|
| content | verified | 20 | 0.70 |
| content | **placeholder_retained** | 22 | **0.68** |
| content | empty_collections | 18 | 0.00 |
| navigation | intact | 24 | 0.75 |
| navigation | **empty** | 17 | **0.65** |
| navigation | dangling | 19 | 0.00 |
| template_version | matching | 35 | 0.43 |
| template_version | **drifted** | 25 | **0.56** |

The bolded rows are the findings: each defect value is statistically
indistinguishable from its correct counterpart, and drifted template version is
*higher* than matching — noise around no effect at all.

The unbolded zeros are the parts that already worked: a dangling navigation route
and empty content collections were both caught reliably. The system rejected
having *no* services while accepting a service named "Servicio principal".

## Run 3 — conditioned, seed 20260826, n=60, after remediation

Same seed and dimensions. The sampler's `verified` fixtures were updated to carry
the new `approvedForPublication` field, since the schema now requires it; that is
the only change to the sampler.

| Dimension | Value | n | Before | After |
|---|---|---|---|---|
| content | verified | 20 | 0.70 | 0.35 |
| content | **placeholder_retained** | 22 | 0.68 | **0.00** |
| content | empty_collections | 18 | 0.00 | 0.00 |
| navigation | intact | 24 | 0.75 | 0.29 |
| navigation | **empty** | 17 | 0.65 | **0.00** |
| navigation | dangling | 19 | 0.00 | 0.00 |
| template_version | matching | 35 | 0.43 | 0.20 |
| template_version | **drifted** | 25 | 0.56 | **0.00** |

Every defect value now has P(all gates pass) = 0.00, and every correct value
retains positive probability. The correct values fell in absolute terms because
passing is now conjunctive across three independent dimensions that previously did
not constrain the outcome at all: a scenario passes only when content is verified
*and* navigation is intact *and* the version matches.

## Limitations

- Small n per cell (17–35). Differences of about ±0.10 are not significant; the
  0.00 versus 0.70 contrasts are far outside that band.
- Four source gates only. The build-dependent gates did not participate in
  sampling, though they were exercised separately end to end.
- Two seeds. Results indicate where risk concentrates, not how often failures
  occur in production.
- The pre-remediation conditioned JSON was overwritten by the post-remediation run
  of the same name; the before-figures survive in the preserved console output
  rather than as machine-readable rows.

## Scenarios promoted to deterministic regression tests

All three defect scenarios are now fixed cases in
`tests/production/validation.test.ts` and `tests/site/routes.test.ts`, so they no
longer depend on sampling to be caught:

- placeholder-retained content with full approvals
- empty navigation
- drifted template version
