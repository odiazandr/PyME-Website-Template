# Monte Carlo and differential scenario report

## Method

The campaign used Python's seeded pseudorandom sampler with seed `20260828`. Category values were sampled uniformly within each synthetic dimension. All mutations occurred in a remote-free disposable clone and were restored from local snapshots between cases. These frequencies identify risk concentration in the chosen synthetic distribution; they are not estimates of production probability.

Three datasets were executed:

1. General readiness: 64 samples over mode, identity, canonical URL class, approvals, privacy state, content state, navigation state, and recorded template version.
2. Conditioned readiness: 32 samples with project mode, client identity/domain, approvals, and privacy fixed to valid values; content, navigation, and template-version state varied.
3. Differential content oracle: 32 samples over publication approvals, location hours/text, service text, testimonial text, canonical class, and approval state. Expected diagnostic sets were derived independently and compared with actual production validation.

Total recorded scenarios: 128. Total crashes: 0.

## Variables

| Dataset | Dimensions |
| --- | --- |
| General | mode (4), identity (2), canonical (3), approvals (3), privacy (2), content (3), navigation (3), template version (2) |
| Conditioned | content (3), navigation (3), template version (2), with five readiness prerequisites fixed valid |
| Differential | location approval (2), hours (2), location text (2), service approval (2), service text (2), testimonial text (2), canonical class (2), approvals (2) |

## Aggregate results

### General, n=64

- All four gates passed: 0/64.
- Any crash: 0/64.
- Memory failure: 27/64 (42.2%).
- Data failure: 20/64 (31.2%).
- Project failure: 56/64 (87.5%).
- Production failure: 64/64 (100%).
- Signature counts `(memory,data,project,production)`: `PPFF` 18, `FPFF` 18, `PFFF` 12, `FFFF` 8, `PPPF` 7, `FPPF` 1.

The zero full-pass frequency is expected under the broad uniform distribution: most random combinations deliberately violate multiple readiness prerequisites.

### Conditioned, n=32

- All four gates passed: 1/32 (3.1%).
- Any crash: 0/32.
- Memory failure: 0/32.
- Data failure: 10/32 (31.2%).
- Project failure: 28/32 (87.5%).
- Production failure: 20/32 (62.5%).
- Signature counts: `PPFP` 11, `PFFF` 10, `PPFF` 7, `PPPF` 3, `PPPP` 1.

Production failure conditional on content:

- `empty_collections`: 10/10 (100%).
- `placeholder_retained`: 10/10 (100%).
- `verified`: 0/12 (0%).

This is strong bounded evidence that the earlier AV2-001 content-domain remediation still works for the sampled canonical data states. Navigation and version associations are not interpreted causally because the production gate is not the sole owner of those dimensions and the sample is small.

### Differential content, n=32

- Independent oracle agreement: 32/32 (100%).
- Crashes or non-OK harness health: 0.
- Actual diagnostic-set signatures: 15, including one `PASS` case.
- Most common signatures: `CONTENT_REVIEW_REQUIRED|PRODUCTION_APPROVAL_REQUIRED|SAMPLE_VALUE` 5; `CONTENT_REVIEW_REQUIRED|SAMPLE_VALUE` 5; `CONTENT_REVIEW_REQUIRED|PRODUCTION_APPROVAL_REQUIRED|PROVIDER_CANONICAL|SAMPLE_VALUE` 4.

The differential result validates only the sampled data-domain contract. It does not contradict `C5-001`, whose triggering copy is hard-coded in presentation components outside the sampled content owners.

## Failure signatures and regression candidates

Across the two gate datasets there were eight unique signatures, seven of which contained at least one failure. Recommended deterministic regressions are:

- The one conditioned `PPPP` scenario as the canonical passing project fixture.
- One example each of `placeholder_retained` and `empty_collections` as mandatory production rejections.
- A dangling navigation case that distinguishes project validation from production content validation.
- Differential cases for each diagnostic owner: content approval, never-open location, provider canonical, production approval, and sample value.
- The presentation-copy bypass from `C5-001`, because it was not represented by the Monte Carlo content dimensions.

## Limitations

- Uniform category sampling does not represent real client or operator frequencies.
- The general sample intentionally overrepresents invalid combinations, making all-pass frequency uninformative for production probability.
- Thirty-two conditioned samples are enough to reveal large effects, not subtle correlations.
- Gate results are correlated because validators consume shared files.
- Platform, latency, network, permissions, and concurrency were handled in separate experiments, not sampled in this harness.
- One privacy fixture remained modified after the final disposable run. The change was confined to the sandbox, recorded, and removed during cleanup; result rows were already written.

Raw per-scenario parameters and results are retained in the adjacent JSON and CSV files.

