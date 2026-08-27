# Interpretation divergence — campaign 4

Four cheapest-class agents were given disjoint, limited-context entry points. None
was told what any other found, none was told what to look for, and none was told a
defect was suspected.

## Convergence, not divergence, on the deploy gate

The notable result is that two agents with **different** limited contexts reached
the same model independently, and it contradicts the repository's own stated intent.

| Entry point | Model formed |
|---|---|
| `netlify.toml`, `package.json`, `deployment.md`, `website-validation.md` | Netlify runs `npm run quality`; six validation steps run and sixteen do not; answered **"No"** to whether the repository automatically verifies the absence of leftover sample facts at go-live; identified the contradiction unprompted |
| `create-client-site.md`, `launch.md`, `README.md`, `CONTRIBUTING.md` | Found **two** concrete commands total, both `init:client`; could not produce the production-gate command; rated own confidence of not publishing leftover sample data at **6.5/10** |

The second agent's failure mode is the interesting one. `launch.md` lists seventeen
things to verify and supplies **zero** commands. `create-client-site.md` ends by
pointing at "the production gate owned by `docs/spec/website-validation.md`" — a
pointer to a specification, not a command. Both agents were following the
repository's own routing correctly; the gap is that the operator path names the step
without ever naming the instruction.

This is the interpretation evidence behind C4-002. It does not by itself prove a
defect — both agents were deliberately context-starved, and a real operator would
read `AGENTS.md` → `PROJECT.md` → `docs/INDEX.md`. What makes it a finding is that it
combines with the deterministic fact that **no automation invokes
`quality:production` anywhere**, so the human path is the only path.

## Where routing worked

The location-task agent, given the whole repository and routed from `AGENTS.md`,
navigated `AGENTS.md` → `PROJECT.md` → `docs/INDEX.md` → `docs/runbooks/add-location.md`
correctly, then derived the E.164 phone format from `src/schemas/common.ts`'s regex
and `docs/spec/content-model.md`. It did **not** copy the differently-shaped
`primaryPhone` object from `business.json`.

That invalidated a campaign hypothesis. I had made exactly that mistake myself while
following the same runbook, and inferred a repository hazard from my own error. The
agent's correct answer is the evidence that the routing is sound and the error was
mine — a useful reminder that "I got this wrong" is not the same as "the repository
made me get this wrong."

The same agent invented a postal code it had not been given (C4-004), while
correctly refusing to set publication approval. Discoverability of the *format*
contract and resistance to *fabrication* are separate properties, and this run
separates them cleanly.

## Where an agent found a class I had only found an instance of

The test-suite reviewer, given `tests/` read-only, independently surfaced the
defaults-pinned-as-invariants pattern across six sites. I had found one instance —
the Netlify build command — and had classified it as a deployment-configuration
issue. The agent's framing showed it was one symptom of a broader class.

Every quoted assertion was then verified against source, and the consequence was
measured independently by renaming a route in a sandbox rather than accepted from
the agent's reasoning. The measurement is what turned a plausible reading into
C4-001 at high severity.

## Terminology and ownership

No divergence found. Every agent that needed a canonical owner located the right
one. `docs/INDEX.md` resolved correctly in each case where an agent had access to
it, and the two agents that hit dead pointers hit them only because the campaign had
deliberately withheld the target files.
