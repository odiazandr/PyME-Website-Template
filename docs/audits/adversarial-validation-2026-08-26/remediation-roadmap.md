# Remediation roadmap — 2026-08-26

Both confirmed findings were remediated in the same session the campaign closed,
and merged through pull request #6 as commits `86d0571`, `bec96e3`, and `c94bf27`.

## Completed

**C3-001 — the committed ruleset diverged from the enforced configuration.**
`.github/rulesets/check-drift.py` compares the committed file against what GitHub
actually enforces, exposed as `npm run check:ruleset`. It compares only fields the
committed file declares, so platform defaults added at import do not become
permanent noise; it derives the repository from the git remote, so it works
unchanged in a client repository; and it reports `UNVERIFIED` rather than passing
when the API is unreachable.

It is deliberately **not** part of `npm run quality` or `npm run quality:production`.
It depends on an external service, and a gate that fails because a network is down
is not a deterministic gate. That distinction is worth preserving: the value of
those two commands is that a green result means the same thing every time.

**C3-002 — the deployment specification recorded the default branch as unprotected.**
Both dated checkpoints were replaced rather than merely corrected. Repository
control now states what is enforced and points at `npm run check:ruleset` to verify
it live. The dependency checkpoint keeps its durable rules — a proposal crossing a
declared compatibility line needs an explicit decision, and major action updates
need rebase and review — and drops the per-pull-request status list that expires
within days.

The reasoning behind replacing rather than correcting: a canonical specification
carrying dated observations about an external system rots on its own, because the
external system changes without any commit here. Correcting the sentence would
have restarted the same clock.

## No action recommended

**C3-003 — sample-value detection is a substring scan over free text.** Confirmed
to behave exactly as specified, including matching registered wording inside a
testimonial quote. The tradeoff is deliberate: a false positive costs a reword at a
production gate with a clear message, a false negative publishes a false business
fact. Recorded so that a future maintainer who hits a false positive understands it
is intended and narrows the scanned fields rather than weakening the phrase list.

## Remaining work, not caused by a finding

Unchanged from the previous campaign except where noted. Ranked by what unblocks
the most.

1. **Deploy one client site end to end.** Still the only unproven layer, and the
   reason four cells in `failure-matrix.csv` read `not_tested`: real response
   headers, form-provider receipt, DNS cutover, and rollback. Requires an
   authenticated Netlify context and a client-owned domain, which
   `docs/spec/deployment.md` makes an explicit stop condition for an agent.
2. **Two verification gaps that only an operator can close.** Whether a direct push
   to the default branch is actually rejected — untestable without a real push,
   which would itself land a commit through the gap being tested — and the live
   ruleset's `bypass_actors`, which GitHub withholds from unauthenticated callers.
   Both are now partially covered by `npm run check:ruleset`.
3. **Manual accessibility review.** Keeps `accessibility` at `partial`. Needs a
   person doing keyboard, zoom, focus, heading, and motion passes.
4. **Lifecycle and migration validation.** Both still `planned` in
   `project-state.json`. In-repo work that does not need external credentials.
5. **Derive the hardcoded route lists** in `tests/browser/smoke.spec.ts` and
   `accessibility.spec.ts` from the navigation config, so a new route gains browser
   and accessibility coverage without a manual edit.
6. **Triage the five open dependency pull requests.** `#4` and `#5` cross the
   pinned Node 24 and TypeScript 6 lines and need a recorded compatibility decision
   rather than a merge. Under the active ruleset all five also need rebasing before
   they can merge.
