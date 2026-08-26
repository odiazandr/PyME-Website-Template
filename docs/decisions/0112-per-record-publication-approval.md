---
owner: docs/decisions/0112-per-record-publication-approval.md
authority: canonical
status: active
answers: ["Why does every published business record carry its own approval?"]
---
# 0112 — Per-record publication approval

## Decision

Every canonical business record that reaches a public page carries its own `approvedForPublication` flag, and production validation refuses to publish any record whose flag is `false`. `src/schemas/location.ts` and `src/schemas/service.ts` join `team.ts` and `testimonial.ts` in requiring the field, so a record cannot exist without stating whether a person cleared it.

Production validation also scans every canonical data domain rather than business identity alone, rejects a published location that is closed on all seven days, and checks the recorded template version on every run rather than only at adoption.

## Context

Adversarial validation on 2026-08-24 hardened the memory layer. The business-content layer built afterwards did not receive the same treatment, and a campaign on 2026-08-25 showed the consequence: a client site passed all fourteen steps of `npm run quality:production` while publishing a street address reading `Dirección pendiente`, a featured service described as reference content pending replacement, and hours closed every day of the week. The placeholder address reached schema.org `PostalAddress` structured data, so the false fact was machine-readable rather than merely visible.

Two independent gaps produced that result. `scripts/validate-production.ts` scanned only `{ business, site }`, and its sample-value list did not contain the wording the template actually ships in the unscanned domains. Closing either alone would have left the failure reachable.

## Alternatives considered

Extending the literal sample-value list and widening the scan was sufficient to close the observed case, but it is the same hand-maintained-list pattern that failed here and in the earlier memory-validator findings. Every fixture added later reopens the hole, and nothing forces the list to keep pace.

Requiring the operator to attest each domain in `production.json` was rejected as too coarse. A single flag covering every service says nothing about which service was reviewed.

The chosen approach was already present in this repository for team members and testimonials. Applying it to the two domains that were skipped makes the rule structural: `z.strictObject` requires the field, so it cannot be forgotten, and the check needs no vocabulary to stay current.

## Consequences

The distribution template can no longer reach production, because its reference location and service ship with the flag set to `false`. That is the intended state: the template is a starting point, not a publishable site.

The string-matching rules remain as a second, independent layer for the case where an operator sets a flag but leaves the text unchanged. `SAMPLE_VALUES` is exported and a test asserts every entry still occurs in the shipped fixtures, so rewording a fixture without reworking its rule fails loudly instead of silently retiring the protection.

The initializer treats outstanding record review as deferred human verification rather than a blocker, and reports each unreviewed record by ID. It does not own locations or services, so it must not refuse adoption because they are still unreviewed.

Automated validation still does not judge whether a business claim is true; `docs/spec/website-validation.md` continues to own that boundary. The distinction this decision draws is narrower and decidable: whether content is still literally the template's is a question a machine can answer, and it should never have depended on a hand-curated list of four strings.
