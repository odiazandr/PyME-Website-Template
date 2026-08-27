# Campaign harness

This campaign added one tool. Everything else it ran was reused, so it is not
duplicated here — a second copy of a script is a second thing to keep correct.

| Tool | Where it lives |
|---|---|
| `differential_content.py` | here; new in this campaign |
| `mksandbox.sh`, `oracle.py`, `regress_prior.py`, `montecarlo.py`, `fuzz_init.py` | `../../adversarial-validation-2026-08-25/harness/` |
| Ruleset drift detection | `.github/rulesets/check-drift.py`, run as `npm run check:ruleset` |

The drift checker was drafted during this campaign and then merged into the
repository as production tooling rather than left as an audit artifact, because it
is worth running whenever repository control changes rather than only during a
campaign.

## differential_content.py

```
python differential_content.py <sandbox-root> <samples> <seed>
```

Samples combinations of eight content-state dimensions, applies each to a
disposable copy, and compares the production gate's verdict against a verdict
derived **independently** from the stated contract. Any disagreement is a defect
in one of the two.

This is the difference from the previous campaign's `montecarlo.py`, which
measured how often the gate passed. A pass rate tells you where risk concentrates;
it cannot tell you whether the gate is *right*. Run 20260826 sampled 80 scenarios
and found 80 agreements and zero crashes, which is a much stronger statement than
any frequency table.

Prefer this shape for any future contract with a specification precise enough to
re-derive. Where a contract cannot be independently derived, fall back to the
frequency sampler.

## Reusing the shared harness

`mksandbox.sh` in the 2026-08-25 archive carries placeholder paths. Replace its
`SRC` and `CAMP` variables before use. That archive's README documents the traps,
of which the important one is that `npm run <script>` cannot resolve
`node_modules/.bin` from a deep temporary path — invoke `node scripts/x.ts` or
`npx --no-install <bin>` directly. This campaign hit that trap in Wave 0 and
briefly misread it as a repository defect; the canonical repository was green the
whole time.
