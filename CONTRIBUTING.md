# Contributing

Read `PROJECT.md` and locate the canonical owner for the change through `docs/INDEX.md` before editing.

Use focused branches such as `feature/...`, `fix/...`, `content/...`, `design/...`, `maintenance/...`, or `migration/...`. Preserve unrelated work, inspect the final diff, and run every available check configured in `memory.toml`.

Material changes should use a pull request. The deterministic and browser workflows provide separate evidence; required checks and `main` protection must also be configured in GitHub repository rules. Never merge merely because one of the two workflows passed.

Consequential architecture changes require a new decision record under `docs/decisions/`.
