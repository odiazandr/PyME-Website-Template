# Remediation roadmap — 2026-08-25

Status as of the remediation pass completed in the same session as the campaign.
Per-finding evidence is in `findings.json`.

## Completed

**AV2-001 — placeholder content through the production gate.** *(High)*
`location.ts` and `service.ts` now require `approvedForPublication`, joining
`team.ts` and `testimonial.ts`. The shipped reference records store `false`, so
the distribution template can no longer reach production. `validate-production.ts`
scans every canonical data domain, rejects unapproved records, and rejects a
published location closed on all seven days. `SAMPLE_VALUES` gained the two
placeholder strings and is exported so a test can assert it still matches the
fixtures; `check-public-output.ts` gained matching `dist/` sentinels.
Decision recorded as `docs/decisions/0112-per-record-publication-approval.md`.

**AV2-003 — site identity reissued on `--force`.** *(Medium)* The initializer
reads the identity back from `src/config/site.ts`, its canonical owner, rather
than asking the input document to repeat a durable fact. The sample UUID is never
preserved. `--new-identity` is required to reissue, and the chosen source is
reported.

**AV2-004 — credentials in the canonical URL.** *(Medium)* `CanonicalUrlSchema`
is now the single owner of the rule and rejects userinfo, path, query, and
fragment. `client-init.ts` reuses it rather than restating a weaker version, so
the two contracts cannot diverge.

**AV2-002 — empty navigation.** *(Low-medium)* `NAVIGATION_EMPTY` in
`validate-project.ts`, plus non-empty guards before every loop-based assertion in
`routes.test.ts`.

**AV2-005 — template version drift.** *(Low)* The consistency check moved out of
the initializer into `validate-project.ts`, so it runs on every build.

**Test improvements.** A content-contract mutation-resistance suite in
`tests/production/validation.test.ts`: eleven cases, each mutating one aspect of a
launch-ready state and asserting the specific rule that must reject it. A rule
with no failing mutation there is a rule that could be deleted without any test
noticing. Plus a drift test asserting every registered sample value still occurs
in the shipped fixtures, gated to template mode so it does not fire in client
repositories.

**Documentation.** `content-model.md` and `website-validation.md` state the
widened contract. `add-service.md`, `add-location.md`, `populate-business-data.md`,
and `create-client-site.md` describe the per-record approval step and the identity
behaviour. A factual error in the then-uncommitted ADR 0111 — it claimed
re-running "cannot silently reissue a site identity" — was corrected.

## Accepted, not fixed

**AV2-006 — TOCTOU race in the already-initialized guard.** *(Low)* Three
concurrent initializers all read `mode = "template"` before any had written, so
all three bypassed the guard and reported success. Left open deliberately: the
realistic operator workflow is a single run, and file locking plus read-back
verification costs more than it returns at this stage. Revisit if initialization
is ever automated across many repositories at once.

## Deferred

**AV2-007 — recovery runbooks state principles, not procedures.** *(Medium at
first client launch)* Incident response, rollback, DNS cutover, template upgrade,
and handoff need ordered steps and an explicit storage location for DNS and deploy
recovery values, and nothing currently covers diagnosing a contact form that
stopped delivering. Deferred until deployment is proven, when these runbooks stop
being theoretical. Doing it earlier would document a recovery path nobody has
walked.

## Remaining work not caused by a finding

Ranked by what unblocks the most.

1. **Prove the Netlify path end to end.** Four failure-matrix cells remain
   untested purely because no deployment exists: response headers in a real
   response, form provider receipt, DNS cutover, and CODEOWNERS enforcement.
   `netlifyDeployment` stays `partial` until then.
2. **Configure the GitHub ruleset.** CODEOWNERS and both CI workflows enforce
   nothing while `main` is unprotected. Recorded in `docs/spec/deployment.md`
   as an external gap since 2026-08-24.
3. **Consider whether browser QA should gate production.** It is currently the
   only layer that catches some regressions, yet it is not part of
   `quality:production`.
4. **Derive the hardcoded route lists** in `smoke.spec.ts` and
   `accessibility.spec.ts` from `navigation`, so new routes get browser and
   accessibility coverage without a manual edit.
5. **Complete the manual accessibility review.** `accessibility` stays `partial`
   until keyboard, zoom, focus, heading, and motion review happens with a person.
6. **README orientation.** A concrete "where business data lives" pointer and a
   one-line description of each quality gate would close the largest
   interpretation gap found in Wave 1.
