# Monte Carlo report

## Method

- Seed: `20260824`
- Samples: 100
- Sampling: independent uniform selection from each declared dimension using Python's seeded pseudorandom generator.
- Execution: each scenario copied the repository into a new temporary directory, applied selected mutations, ran `python ops/memory_health.py`, recorded exit/output, then discarded the copy.

Dimensions:

- mode: template, project, uppercase project, missing, malformed
- document: intact, deleted indexed document, added unindexed document, missing frontmatter
- metadata: valid, invalid authority, invalid status, duplicate ownership question
- index: intact, duplicate row, removed row
- placeholder: none, constitution, README, reserved source
- encoding: UTF-8, UTF-8 BOM, invalid UTF-8

## Aggregate result

| Result | Count | Frequency |
|---|---:|---:|
| Accepted | 29 | 29% |
| Structured rejection | 37 | 37% |
| Crash | 34 | 34% |

There were 13 unique output signatures. All 19 scenarios with malformed TOML crashed; invalid UTF-8 was associated with 24 crashes among 32 samples. Deleted indexed documents were accepted in 22 of 31 mixed scenarios, demonstrating concentration around the stale-index false pass. Invalid authority and invalid status appeared in accepted scenarios because their values are not validated.

These are adversarial combinations, not a production distribution. Frequencies measure validator behavior under this sampling design and must not be interpreted as production probabilities. Mixed mutations can mask one another: a correctly rejected mutation may conceal a simultaneous false-pass condition.

## Deterministic regression candidates

1. Missing indexed target must fail.
2. Unknown and missing mode must fail.
3. Project mode must distinguish documentation of placeholder syntax from an unresolved placeholder instance.
4. Invalid authority/status/answers type must fail.
5. Duplicate and prose-only index references must fail.
6. README and active source placeholders must follow an explicit scan contract.
7. Malformed TOML and invalid encoding must return structured failures, not tracebacks.
8. Configured checks must report `PASSED`, `FAILED`, or `UNVERIFIED`.

Raw parameters, outputs, signatures, and per-variable counts are stored in `monte-carlo-results.json`.
