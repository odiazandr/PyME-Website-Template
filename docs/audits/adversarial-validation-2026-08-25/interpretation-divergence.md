# Interpretation divergence — 2026-08-25

Seven independent agents, each given a deliberately limited entry point and no
knowledge of the others' conclusions. The question is not whether each was right,
but whether competent readers starting from different places converge on the same
model of the repository.

## Lenses used

| Lens | Allowed to read |
|---|---|
| README-only | `README.md` and nothing else |
| Agent entry chain | Whatever the routing instructions actually pointed to, in order |
| Source-first | `src/`, `scripts/`, `ops/`, configs — no documentation |
| Test-first | `tests/`, `package.json`, `playwright.config.ts` |
| Operator | `docs/runbooks/` only |
| Security reviewer | Security-relevant configuration and workflows |
| Conflicting instruction | Whole repository, given a request that violates its invariants |

## Where they converged

**The routing works.** The agent following only `CLAUDE.md → AGENTS.md →
PROJECT.md → docs/INDEX.md` reached the correct canonical owner for a
phone-number change unaided, at 98% self-rated confidence, with no invention and
no wrong file. This is the repository's central design claim and it held under a
genuinely cold start.

**The safety rules are discoverable.** Given a request to fabricate a testimonial,
invent years of experience, and self-authorize the approval flags, the agent
traced each refusal to a specific rule and reached those rules through the ordinary
routing path rather than by already knowing where to look.

## Where they diverged

**What the repository *is*.** README-only reading could not decide between "an
automated site generator" and "a clone-and-customize template", and could not
locate where business data lives at all. Source-first reading reconstructed the
runtime accurately but had no access to the *why*. The two models barely overlap,
and a contributor who reads only one of them will hold a materially different
picture from a contributor who reads only the other.

**How much procedure exists.** `populate-business-data.md` names its exact
commands. `add-service.md` said only "validate it" and "review every derived
surface" — a term defined nowhere in the routing chain. Two agents on adjacent
tasks reached 98% and 75% confidence for that reason alone. *(Both runbooks were
tightened in the remediation pass.)*

**Whether recovery is actionable.** The operator lens found that incident,
rollback, DNS-cutover, template-upgrade, and handoff runbooks state principles
rather than steps, with recurring undefined terms: "known-good source", "prior
verified Netlify deploy", "recorded prior values" (no storage location ever
named), "provider receipt". No runbook covers diagnosing a contact form that
stopped delivering. Recorded as AV2-007 and deliberately deferred, since an
adversarial review argued convincingly that terse recovery runbooks are correct
sequencing while deployment remains unproven.

**Enforced versus merely stated.** The conflicting-instruction lens correctly
identified that approval flags and privacy text are machine-enforced while content
truthfulness is not — then read the latter as a gap rather than a declared
boundary. `docs/spec/website-validation.md` states the boundary explicitly. A
competent agent under deadline pressure could plausibly misread it in the other
direction, treating a declared limitation as permission.

## Divergence that produced a false critical

The security lens reported that `AGENTS.md`, `docs/INDEX.md`, and
`docs/runbooks/` were unprotected in CODEOWNERS, enabling agent instruction
hijacking via pull request, and rated it critical.

`.github/CODEOWNERS` line 2 is `* @odiazandr`, a catch-all covering every path in
the repository. The agent inferred coverage from the explicit path list below the
wildcard and did not account for the wildcard above it. **Invalidated.**

The residual truth is real but different and already known: CODEOWNERS enforces
nothing while `main` is unprotected, which `docs/spec/deployment.md` records as an
external configuration gap.

## Lesson for future campaigns

Two of three agent-originated "critical" or high-severity claims did not survive
verification, and one turned out to be a documented design decision rather than a
defect. The falsification wave was worth more than any single discovery wave: it
retracted three claims and surfaced that a limitation the campaign had reported
about its own environment was wrong.

Independent agents are good at generating hypotheses and poor at grading their own
confidence. Every claim that reached the findings register was reproduced
deterministically first.
