# Remediation roadmap — campaign 4

Ranked by impact against evidence, cost, and dependency order. Nothing here has
been implemented: discovery and repair are separate phases, and implementation was
not authorized.

## Immediate containment

None required. No finding is actively causing loss, and no finding affects the
canonical template's own green state. C4-001 harms *adopters*, and no client
repository exists yet — which makes this the cheapest possible moment to fix it.

## High priority

**1. Stop pinning template defaults as invariants (C4-001).**
Impact: high — today it blocks an adopter from deploying. Evidence: measured, three
sites. Cost: moderate. Risk: low. No dependencies.

Derive expectations from the canonical owners instead of literal lists:

- `tests/site/routes.test.ts` — derive the required page set from
  `src/config/navigation.ts` plus the contextual routes, not a hardcoded array.
- `tests/artifacts/site-output.test.ts` — assert the structural rules ("every
  navigation destination appears in the sitemap", "every non-indexable route
  declares noindex", "the contact form posts to the configured thank-you route")
  rather than the reference site's specific slugs and form name.
- `tests/security/test_netlify_config.py` — accept either gate as the build
  command, or assert that the command is one of a known-safe set.
- `tests/security/test_github_workflows.py` — assert the two required workflows are
  present rather than that they are the only ones.

Where a literal genuinely must be pinned for the distribution template, gate it on
`memory.toml` mode being `template`, the pattern already used in
`tests/production/validation.test.ts`.

Then add a step to `docs/runbooks/adopt-template.md` naming which tests encode
reference-site specifics, so an adopter who does hit this knows where to look.

**Verification:** in a sandbox, rename one route and update the navigation config;
the full quality gate should pass. It fails today.

## Medium priority

**2. Put the production gate on an automated path (C4-002).**
Impact: medium. Evidence: confirmed. Cost: low. Depends on item 1 — adding a
production-gate job before the pinned-literal tests are fixed would make an
adopter's build fail in two places instead of one.

Add a CI job that runs `npm run quality:production` when `memory.toml` mode is
`project`. The distribution template keeps building previews unaffected; adopted
client repositories gain automated enforcement of the gate that today depends
entirely on a person remembering. Separately, write the literal command into
`docs/runbooks/launch.md` rather than pointing at a specification — an agent given
only the operator-path runbooks could not produce it.

**3. Record the dependency compatibility decisions (C4-006).**
Impact: medium — three red PRs are sitting on the default branch's queue.
Cost: very low. No dependencies.

`docs/spec/deployment.md` already requires this. Record in
`docs/runbooks/maintenance.md`: TypeScript 7 (#5) breaks CI, with the run as
evidence; `@types/node` 26 (#4) passes CI but crosses the pinned Node major, and
green CI is **not** evidence of Node-major compatibility; the two failing Action
majors (#1, #2) need rebase and immutable-SHA verification.

## Low priority

**4. Share the structured-error path across validators (C4-003).**
Move `validate-data.ts`'s dynamic-import-inside-try/catch and ZodError formatting
into `scripts/lib/validation.ts`, and use it from `validate-project.ts`,
`validate-production.ts`, `init-client.ts`, and `verify-dist.ts`. Cost: low.
Verification: corrupt one field type, assert no `at ModuleJob` frame in stderr.

**5. Close invariant 4's enumeration (C4-004).**
Change PROJECT.md invariant 4 to an open list, or add address, contact, and
location facts explicitly. Mark postal code in `add-location.md` as a value that
must be supplied rather than inferred. Cost: trivial.

**6. Delete the two stale branches (C4-005).**
`ci/main-branch-ruleset` and `docs/archive-campaign-3`, locally and on the remote,
after confirming their trees match `c94bf27` and `394cf85`. Cost: trivial. This is
the user's call, not an agent's.

## Long-term hardening

- **Do not treat a single behavioural probe as a durable guarantee.** Campaign 3
  recorded an agent refusing to invent a postal code; campaign 4 saw one invent it.
  Behavioural results should be re-run under varied framings each campaign, and
  recorded as observations rather than properties.
- **Prefer differential testing.** The 80/80 agreement at a new seed is worth more
  than any pass-rate table, and it is cheap to re-run. Extend the same shape to any
  future contract precise enough to re-derive independently.
- **Fix the delegation pattern before the next campaign.** Subagents inherit the
  session working directory; a sandbox path in the prompt does not change it. Use an
  agent type with no write tools for analysis, and verify the working directory
  before any agent is allowed to write.
- **The remaining gap is still external.** Netlify headers, form receipt, DNS
  cutover, direct-push rejection, the bypass list, and manual accessibility review
  all need credentials, a domain, or a person. The template is ready; the proof is
  what is missing.

---

## What was actually done

Recorded after the fact. The user reviewed the findings and authorized
implementation; the work landed on `fix/campaign-4-remediation`.

| Item | Commit | Outcome |
|---|---|---|
| 1. Stop pinning defaults as invariants (C4-001) | `fix: derive route contracts from a single registry` | Done, and wider than proposed. `src/config/navigation.ts` became the route registry with stable identifiers; the sitemap filter, robots directive, form action, page links, required-artifact list and every route-aware test derive from it. `scripts/verify-dist.ts` turned out to carry the same hardcoded list and was fixed too. |
| 1b. Security test allowlists (C4-001) | `fix: stop pinning adopter-owned configuration in security tests` | Done. The build command now accepts either quality gate and the workflow set is a subset check. No security property weakened; verified with a negative control. |
| 2. Automate the production gate (C4-002) | `ci: run the production gate for client repositories` | Done. A `Client production gate` job runs `quality:production` when `memory.toml` is in project mode. `netlify.toml` deliberately keeps the development gate so Deploy Previews of work in progress still build. `launch.md` now carries literal commands. |
| 3. Record dependency decisions (C4-006) | `docs: close the fabrication invariant and record dependency decisions` | Done, with the CI evidence behind each. |
| 4. Share the structured-error path (C4-003) | `fix: report structured findings from every data-aware command` | Done differently than proposed. Making the validators async would have rippled through their synchronous consumers, so a `node --import` guard runs before the entry module instead. Same outcome, no API change. |
| 5. Close invariant 4 (C4-004) | `docs: close the fabrication invariant and record dependency decisions` | Done. The enumeration is now open and names address, contact and location facts. |
| 6. Delete the stale branches (C4-005) | not done | Deliberately left. Deleting a remote branch is an externally consequential action and remains the user's call. |

Two things changed shape once implementation started, which is worth recording:
`verify-dist.ts` was a sixth instance of C4-001 that the discovery phase had not
inspected, and the route-ownership guard test immediately caught a case I had
consciously decided to leave alone — `src/pages/index.astro` still hardcoded one
slug. Rather than adding an exemption to the test, the registry gained stable
route identifiers so the last literal could go. A guard that is weakened the
first time it fires is not a guard.

## Verification of the remediation

The full deterministic suite is green: memory contracts, format, `astro check`
(57 files, 0 errors), data, site, production, artifacts, security, and memory
mutation tests.

`harness/lifecycle.py` was re-run against the remediated tree and still reports
**14/14** on `quality:production`. Renaming a primary slug and a contextual slug
in a disposable copy now leaves the development gate green, which is the exact
scenario that failed during discovery.

`npm run check:ruleset` still passes: the committed ruleset was intentionally
left unchanged, so adding `Client production gate` to the required contexts
remains an explicit repository-rules decision rather than a silent drift.
