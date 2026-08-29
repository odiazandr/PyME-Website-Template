# Adversarial repository validation — 2026-08-27

Fourth campaign. **No commits, pushes, merges, or PR actions were performed.** The
canonical repository ended byte-identical to where it started.

Companion files: `findings.json`, `failure-matrix.csv`, `campaign-ledger.json`,
`remediation-roadmap.md`, `interpretation-divergence.md`, `final-integrity.md`, and
the machine-readable evidence alongside them. `harness/` holds only what this
campaign added; see its README.

**All five findings were remediated after this campaign closed**, on
`fix/campaign-4-remediation`. `findings.json` is the register as written during
discovery; `remediation-roadmap.md` records what was done and what was
deliberately left alone.

---

## Executive summary

**The template's central product claim is now verified rather than asserted, and
the most serious weakness found is that the template breaks its own adopters when
they customize it the way its specifications tell them to.**

`main` was at the campaign-3 archive commit, so the source delta since the previous
campaign was **empty**. Re-running campaign 1–3 attacks would have been
near-guaranteed zero yield, so effort went instead to claims the repository makes
that had never been executed end to end, plus live operational state.

**The headline positive result.** `project-state.json` records `lifecycleTest` as
`planned`. This campaign ran it: template → `npm run init:client` → the human
content steps the runbook prescribes → **all fourteen steps of
`npm run quality:production`, every one passing**, ending in a 7-page build,
7/7 artifact tests, and clean dist verification, link, and public-output checks.
The claim that the strict gate rejects the uninitialized template but passes for a
properly initialized client is now evidence rather than design intent.

**The headline defect.** Several tests pin *template defaults* as though they were
*invariants*. Renaming one route slug — which `docs/spec/routing.md` explicitly
sanctions, updating the navigation config it calls the single owner — leaves
`astro check` at zero errors and the build succeeding, while `tests/site/routes.test.ts`
and `tests/artifacts/site-output.test.ts` both fail. Because `test:artifacts` is
part of `npm run quality`, and `npm run quality` is **both** the required CI check
**and** the `netlify.toml` build command, a correct documented customization blocks
the merge *and* fails the production build. The client cannot deploy. The same
pattern pins the deploy command itself: hardening `netlify.toml` to the strict gate
makes the repository's own test suite fail.

**Five findings, five claims invalidated — three of them mine.** Highest severity
is high, and it is a build-blocking adoption defect rather than a data or security
failure. Nothing found lets incorrect content reach a client's public site through
the gates; the content contract agreed with an independently derived oracle on 80
of 80 previously unsampled scenarios.

**Confidence is high for everything reachable without credentials.** Five cells
remain untested, each for a stated reason: real Netlify headers and form receipt,
DNS cutover, direct-push rejection, the ruleset's bypass list, and manual
accessibility review. None can be substituted for from an agent session.

## Findings

| ID | Finding | Severity | Status |
|---|---|---|---|
| C4-001 | Template defaults pinned as invariants; a documented customization breaks CI and the production build | High | Confirmed |
| C4-002 | The strict production gate runs on no automated path | Medium | Confirmed |
| C4-003 | Diagnostic validators emit raw tracebacks instead of structured findings | Low | Confirmed |
| C4-004 | A cold agent invented a postal code; campaign 3 recorded the opposite as assurance | Low | Confirmed |
| C4-005 | Two local branches whose content is on `main` report as unmerged | Informational | Confirmed |
| C4-006 | Three of five open dependency PRs have red CI; the one policy flags is green | Informational | Confirmed |

**C4-001** is one root cause with six symptom sites, three of them measured rather
than reasoned. The repository already contains the *correct* structural test —
routing.md notes that a deterministic contract test verifies every configured
navigation destination has an explicit page. The problem is the redundant hardcoded
literal lists sitting beside it. `docs/runbooks/adopt-template.md`'s six steps never
mention adapting the inherited tests, so an adopter hits a red build with nothing
pointing at the cause.

**C4-002** was narrowed by falsification. The strong form — that nothing routes an
operator to the production gate — is false: `create-client-site.md` ends by directing
the reader to it. What survives is that no workflow, script, or hook invokes
`quality:production` anywhere, `netlify.toml` and `ci.yml` both run the gate that
`website-validation.md` says "must never be interpreted as production approval," and
`launch.md` names the step without ever giving the command. Two context-limited
agents reached this independently; one, given only the operator-path runbooks, could
not produce the command at all.

**C4-004** is worth more as a caution than as a defect. The designed control held —
the agent set `approvedForPublication: false` and disclosed its inference — and the
repository openly states that automated validation cannot judge whether business
claims are true. The finding is that campaign 3's reassuring behavioural result did
not reproduce under a different framing, and that invariant 4's list of things never
to invent is a closed enumeration that omits address facts.

## Invalidated

- **A phone-shape interpretation hazard.** My own hypothesis, formed after I made
  the mistake myself. A cold agent routed through the repository's documents derived
  the correct E.164 format from the schema and content model. The routing works.
- **The CSP could block the site's own inline styles.** My own hypothesis. Built
  output carries 5 `script-src` and 8 `style-src` hashes that Astro appends
  automatically; every inline block is covered.
- **`CHANGELOG.md` omits the recent feature work.** My own hypothesis. All of it is
  recorded.
- **The repository build is broken.** Windows Application Control blocked an
  unsigned native binding. CI was green on the identical SHA throughout, and the
  block released on its own mid-session, after which every local build succeeded.
  Environment condition, never a repository defect.
- **No documentation routes an operator to the production gate.** See C4-002.

## Regression against prior campaigns

All 13 campaign-1 memory mutations remain closed, with a green pristine baseline
before and after. The 32-case initializer fuzz reports zero crashes and zero wrong
acceptances. Campaign 3's content differential was re-run **at a new seed** —
80 previously unsampled scenarios, 80/80 agreement with the independently derived
oracle, zero crashes. Across two campaigns that is 160 distinct scenarios with no
disagreement.

Both campaign-3 findings are verifiably remediated: `npm run check:ruleset` reports
the live ruleset matches every field the committed file declares, and
`deployment.md` now states durable rules instead of a dated snapshot.

## Method and cost

Four cheapest-class (`haiku`) agent invocations, **zero premium subagents**, roughly
46 deterministic tool runs, 8 disposable sandboxes, 80 sampled scenarios, 32 fuzz
cases, 13 replayed mutations, 12 live API queries. Well inside the proposed budget
of 24 cheap invocations.

Deterministic tooling found or confirmed every finding. Agents were most useful for
interpretation divergence and for surfacing the defaults-pinned class — but as in
campaigns 2 and 3, agent output was treated as hypothesis: every quoted claim was
verified against source, and the consequence was then measured independently rather
than accepted.

**Three of the five invalidated claims were my own.** That ratio is the reason the
confirmation step exists.

## Incidents

**An isolation breach occurred and was contained.** A subagent given a sandbox path
and an explicit instruction not to leave it wrote to the canonical repository
instead: subagents inherit the session working directory, and a path in the prompt
does not change it. Detected immediately from the agent's own report, reverted with
`git checkout`, and verified byte-identical to HEAD with the gates re-run green. No
commit, no push, no loss — the pre-campaign tree was clean. Every subsequent agent
was given read-only work, and the last used an agent type that has **no write tools**
rather than relying on instruction. Recorded here because a campaign that hides its
own near-miss is not worth running.

## Not tested

Five cells, each for a stated reason rather than an oversight:

- **Netlify response headers and form receipt** — no deployment exists.
- **DNS cutover** — no domain.
- **Direct-push rejection** — requires a real push, which would itself put a commit
  on the default branch through the gap being tested.
- **The live ruleset's bypass list** — withheld from unauthenticated callers.
- **Manual accessibility review** — requires a person.

Also untested: template-upgrade migration of an initialized client, which has no
second template version to migrate from, and interrupted/partial-write state during
initialization.

## Final integrity

Canonical repository present; HEAD unchanged at `394cf857bed180bb33672ad84a7657fb26ec6ec7`;
working tree clean and identical to HEAD; four branches unchanged; zero untracked
files; no commits, pushes, tags, merges, deployments, or external writes. Memory
contracts, data validation, and security tests re-run green after the incident
revert. No secrets appear in any artifact. All disposable sandboxes are under the
session scratchpad and may be deleted freely.
