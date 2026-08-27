# Final integrity check — 2026-08-26

This campaign ran under a stricter constraint than its predecessors: the user
required that **no commits, pushes, or merges** occur until it completed. Discovery
was therefore entirely read-only against the canonical repository, and the
remediation that followed is recorded separately in `remediation-roadmap.md`.

## Canonical repository

- Baseline recorded before any experiment: **263 files hashed**, working tree
  clean, `HEAD` / `main` / `origin/main` captured.
- Re-hashed at the end of the campaign: **byte-identical**, 263 files.
- Files created or modified in the canonical repository during the campaign:
  **none**.
- One deliberate exception, reverted within the same step: the ruleset file was
  edited briefly to serve as a negative control for the drift checker, then
  restored from a saved copy and verified back to zero modifications before
  anything else proceeded.

All mutation work ran in five disposable sandboxes produced by the harness
archived with the 2026-08-25 campaign — a `tar` copy of the working tree with a
directory junction to the canonical `node_modules`, which was never written
through.

## Actions never taken

- No commits, pushes, merges, or tags during the campaign.
- No write of any kind to the GitHub API. Every remote observation was an
  unauthenticated read of a public endpoint.
- No Netlify site created, linked, or contacted. No DNS record read or changed.
- No credential read, written, extracted, or transmitted. The live ruleset's
  `bypass_actors` field was left unverified rather than obtain an admin token to
  read it.
- No direct push attempted against the protected default branch, deliberately: if
  the ruleset had not been enforcing, the attempt itself would have landed a commit
  through the exact gap being verified.

## Secrets

No secret, credential, token, or private operational value appears in any artifact
in this directory. Machine-specific absolute paths were replaced with the
placeholders `<repository>`, `<sandbox>`, and `<scratchpad>`; a scan for the local
account name returns zero occurrences. `live-ruleset-observed.json` is a public,
unauthenticated API response and contains no bypass or actor identifiers.

## Repository state at close

| Check | Result |
|---|---|
| `python ops/memory_health.py --scope contracts` | PASSED |
| `npm test` | exit 0 |
| Canonical manifest versus baseline | byte-identical, 263 files |
| Working tree | clean |
| Refs | unchanged during the campaign |

## A known local hazard, not a defect

`npm run build` and `npm test` can fail on the development machine with
`An Application Control policy has blocked this file`, naming an unsigned native
binding under `node_modules`. Observed with `@rolldown/binding-win32-x64-msvc` and
later with `@bruits/satteri-win32-x64-msvc`. The block is transient: Windows
withholds a reputation verdict on a newly-seen unsigned binary and releases it
later, with no action required.

This is recorded because it caused a real error in the previous campaign, where an
entire failure-matrix column was written off as untestable on that basis. **CI on
Ubuntu with a clean `npm ci` is the authoritative signal** and has been green every
time this fired locally. Never conclude the repository is broken from this message.

## Disposable artifacts

Five sandboxes were removed after the artifacts here were produced; four directory
junctions were unlinked first, as reparse points, so deletion could not follow them
into the canonical `node_modules`, which was verified intact before and after. The
remaining scratchpad evidence is duplicated in this directory.

**No cleanup remains.**
