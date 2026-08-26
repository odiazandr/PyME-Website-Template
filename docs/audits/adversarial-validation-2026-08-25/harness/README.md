# Campaign harness

Re-runnable tooling from the 2026-08-25 adversarial validation campaign. Kept so a
future campaign can reproduce these results and compare regressions over time.

**Every script operates on a disposable copy. None of them modify the canonical
repository.** `mksandbox.sh` holds the paths the others assume; update the `SRC`
and `CAMP` variables at its top before reuse, since they were absolute to the
machine that ran the campaign.

| Script | Purpose |
|---|---|
| `mksandbox.sh` | Creates a disposable copy of the working tree with a directory junction to the canonical `node_modules`. Prints the sandbox path. Windows-specific: the junction is created through PowerShell. |
| `oracle.py` | Runs every locally-runnable gate and records structured pass/fail as JSON. Establishes the baseline before any attack. |
| `regress_prior.py` | Applies thirteen mutations corresponding to the confirmed findings of the 2026-08-24 campaign and asserts each is now rejected. The regression oracle for the memory layer. |
| `montecarlo.py` | Seeded scenario sampler over eight repository-state dimensions. Pass `conditioned` as the fourth argument to pin the launch-ready dimensions and sample only what the gates claim to protect. |
| `fuzz_init.py` | Thirty-two adversarial inputs against the client initializer. Every case must produce a clean structured finding or a clean success; a stack trace is a defect. |

## Typical sequence

```
SB=$(bash mksandbox.sh baseline)
python oracle.py "$SB" baseline-oracle.json

SB=$(bash mksandbox.sh regression)
python regress_prior.py "$SB"

SB=$(bash mksandbox.sh fuzz)
python fuzz_init.py "$SB"

SB=$(bash mksandbox.sh mc)
python montecarlo.py "$SB" 60 20260826 conditioned
```

## Notes for a future run

`node_modules` is reached through a junction to save 230 MB per sandbox. Node
scripts run correctly through it, but `npm run <script>` cannot resolve binaries
in `node_modules/.bin` from a deep temporary path — invoke `node scripts/x.ts` or
`npx --no-install <bin>` directly, or make a real copy when the full
`quality:production` sequence is needed.

Unlink the junction before deleting a sandbox recursively, or the deletion will
follow it into the real `node_modules`. `mksandbox.sh` already does this when it
rebuilds a sandbox of the same name.

`montecarlo.py` writes fixtures matching the schemas at the time it was written.
If a schema gains a required field, the sampler's `verified` fixtures must gain it
too, or that arm will fail validation and the comparison will be meaningless
rather than merely wrong. This happened once during the campaign and produced a
run where every dimension read 0.00.
