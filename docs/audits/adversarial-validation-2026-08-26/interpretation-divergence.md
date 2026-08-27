# Interpretation divergence — 2026-08-26

Three limited-context agents this campaign, against the surface that changed since
2026-08-25. Fewer than the eight lenses of the previous campaign, because the
question was narrower: does the new content contract survive contact with a reader
who did not write it, and does the newly gated path to the default branch read the
way it behaves.

An account session limit killed the first three agent launches mid-wave. They were
retried once it cleared. That is recorded here rather than hidden because it is the
reason this wave is thinner than planned.

## Lenses

| Lens | Allowed to read |
|---|---|
| Content contract | `src/schemas/`, `src/data/`, `scripts/validate-production.ts` — no documentation |
| Merge path | `.github/`, `docs/spec/deployment.md` |
| Fresh agent, realistic task | whatever the repository's own routing directed it to |

## Where they converged with reality

**The content contract is discoverable by the readers it was written for.** The
fresh-agent lens was given a plausible business request — a second branch in
Cholula with specific hours, plus a new service — and told to prepare the site for
publishing. Working only from the repository's own routing it:

- set `approvedForPublication: false` on both new records, citing the rule
- refused to set the three production flags, quoting the prohibition
- refused to switch memory mode
- **refused to invent the postal code it had not been given**, flagging it for
  external verification rather than copying `72000` from the neighbouring fixture
- refused to invent a service description

That last pair matters most. The nearest example in the repository contains a
plausible-looking postal code, and copying it would have produced a schema-valid,
gate-passing, factually false address — precisely the failure the 2026-08-25
campaign found in its shipped form. The agent did not take the bait.

**The merge path reads the way it behaves.** The merge-path lens independently
derived that renaming a job, deleting a workflow, or adding a `paths:` filter all
fail safe, and that renaming a *workflow* has no effect because the ruleset keys on
job display names.

## Where a reader diverges from reality

**The `z.literal(true)` versus `z.boolean()` split.** The content-contract lens,
reading code only, noticed that team members and testimonials cannot exist
unapproved while locations and services can, and judged the inconsistency
deliberate. It is — locations and services are required to be non-empty, so they
must be storable in an unapproved state — but nothing in the code says so. The
reader reached the right conclusion by inference, not by being told.

**A stale specification actively misinformed a reader.** The merge-path lens
reported, correctly quoting `docs/spec/deployment.md`, that "the ruleset file
exists but may not yet be active in GitHub", and built a conditional analysis
around the possibility that the default branch was unprotected. It was protected.
The document said otherwise. This is the clearest demonstration in three campaigns
of why a dated observation inside a canonical specification is a defect rather
than a note: it did not merely age, it caused a competent reader to reason from a
false premise. Recorded as C3-002 and since corrected.

## An agent claim that did not survive verification

The merge-path lens concluded that dependabot pull requests "require human
approval" under the ruleset. They do not: `required_approving_review_count` is 0.
The lens conflated *a pull request being required* with *an approval being
required*. Verified against the live ruleset and invalidated.

That is the third consecutive campaign in which an agent-originated claim reached
the synthesis step and was rejected there. The confirmation stage continues to earn
its cost.
