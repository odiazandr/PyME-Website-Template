# Final integrity — campaign 4

## Canonical repository

| Check | Result |
|---|---|
| Repository present | yes |
| HEAD at campaign start | `394cf857bed180bb33672ad84a7657fb26ec6ec7` |
| HEAD at discovery close | `394cf857bed180bb33672ad84a7657fb26ec6ec7`, unchanged |
| Working tree at discovery close | clean, identical to HEAD |
| Untracked files created | none |
| Branches altered | none |
| Stash entries | none |
| Commits, tags, pushes, merges during discovery | none |

Discovery and remediation were separate phases. The campaign itself wrote nothing
to the canonical repository; the fixes that followed were made on
`fix/campaign-4-remediation` after the user reviewed the findings and authorized
implementation.

## External actions

No deployment, no DNS change, no Netlify site, no credential use, no package
publication, no message sent. GitHub was read through the unauthenticated API
only: check-run status for `main` and for the five open pull requests, branch
existence, and the live ruleset via `npm run check:ruleset`. No write endpoint
was called.

## Isolation incident

One occurred and was contained.

A subagent was given a disposable sandbox path and an explicit instruction not to
write outside it. Subagents inherit the session working directory, which was the
canonical repository, so its relative paths resolved there and it appended a
location record to `src/data/locations.json`.

Detected immediately from the agent's own report, which cited the canonical path.
Reverted with `git checkout -- src/data/locations.json`. The tree was then
verified byte-identical to HEAD, and memory contracts, data validation, and the
security suite were re-run green. No commit, no staged change, no push, and no
loss of user work — the pre-campaign snapshot was clean, which is why the revert
was provably lossless.

Every subsequent agent received read-only analysis work, and the last used an
agent type with no write tools rather than relying on instruction. Recorded here
because a campaign that conceals its own near-miss is not worth running.

**For future campaigns:** a sandbox path in a prompt does not change an agent's
working directory. Pass an agent type without write tools, or verify the working
directory before the agent acts. Snapshot `git status` first so any revert is
provably lossless.

## Secrets

No credential, token, key, or personal datum appears in any campaign artifact.
The client fixture used throughout — `Taller Nopal`, `https://tallernopal.mx` — is
invented for the harness and corresponds to no real business. Absolute local
paths were kept out of every committed file; they appear only in the session
scratchpad, which is not part of the repository.

## Disposable artifacts

All sandboxes were created under the session scratchpad and have been deleted.
`node_modules` junctions were unlinked before deletion, and the canonical
`node_modules` was verified intact at 231 packages before and after.

No cleanup remains.
