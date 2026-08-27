# Campaign harness

This campaign added one tool. Everything else it ran was reused, so it is not
duplicated here — a second copy of a script is a second thing to keep correct.

| Tool | Where it lives |
|---|---|
| `lifecycle.py` | here; new in this campaign |
| `differential_content.py` | `../../adversarial-validation-2026-08-26/harness/` |
| `mksandbox.sh`, `oracle.py`, `regress_prior.py`, `montecarlo.py`, `fuzz_init.py` | `../../adversarial-validation-2026-08-25/harness/` |
| Ruleset drift detection | `.github/rulesets/check-drift.py`, run as `npm run check:ruleset` |

## lifecycle.py

```
python lifecycle.py <repository-root> <sandbox-root>
```

Runs the whole client lifecycle in a disposable copy: initializer, then the human
steps `docs/runbooks/create-client-site.md` prescribes, then all fourteen steps of
`quality:production` in their declared order, stopping at the first failure.
Writes `lifecycle-results.json`.

`project-state.json` carried `lifecycleTest: "planned"` from the moment the
capability list was written, and campaign 4 was the first to execute it. The run
archived here reports **14/14**. It was re-run after this campaign's remediation
commits and still reports 14/14, which is the reason `lifecycleTest` moved to
`verified` rather than on the strength of a one-time manual sequence.

Prefer this shape for any capability the project claims but has never exercised
end to end. A capability list is a set of assertions; each one is worth a harness
that can be re-run against a later commit.

## Reusing the shared harness

`mksandbox.sh` in the 2026-08-25 archive carries placeholder paths. Replace its
`SRC` and `CAMP` variables before use. The important trap, documented there and
hit again here, is that `npm run <script>` cannot resolve `node_modules/.bin`
from a deep temporary path — invoke `node scripts/x.ts` or
`npx --no-install <bin>` directly. `lifecycle.py` already does.

Unlink the `node_modules` junction before deleting a sandbox recursively, or the
deletion will follow it into the real `node_modules`. `lifecycle.py` does this
when it rebuilds a sandbox at the same path.

`differential_content.py` is worth re-running at a **new seed** rather than the
archived one: same oracle, previously unsampled scenarios, no design cost. This
campaign ran seed `20260827` and recorded 80/80 agreement, which together with
campaign 3's seed `20260826` makes 160 distinct scenarios with no disagreement.
