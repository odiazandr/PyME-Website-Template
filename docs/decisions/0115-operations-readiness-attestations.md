---
owner: docs/decisions/0115-operations-readiness-attestations.md
authority: canonical
status: active
answers: ["Why are client operations attestations separate from site deployability?"]
---
# 0115: Operations-readiness attestations

## Decision

Treat site deployability and client operations readiness as independent launch claims. Keep site-deployability checks in `quality:production`; validate a separate non-sensitive `operations-readiness.json` checklist with `validate:operations`; require both through `quality:launch`.

The checklist records only boolean human attestations. It must not include the names or contact details of responsible people, monitored inboxes, credentials, retention records, emergency procedures, or other private operational data.

## Rationale

A successful static build, CI run, deployment, route check, and form-provider configuration cannot prove that a business receives submissions, responds to customers, deletes stale data, or has a workable rollback and escalation process. Folding those claims into a technical gate would overstate what automation can know. Omitting them creates a launch gap precisely where real small-business failures are likely to occur.

Human attestations make the outstanding work visible while preserving the boundary that agents and automated checks cannot self-authorize external business facts. A public-site data domain is not appropriate because the checklist is operational, not visitor-facing.

## Consequences

Client initialization leaves operations readiness outstanding and reports it as a human follow-up. A client may be technically deployable while its operations gate fails; it is not ready for final launch until both pass and external provider evidence and client sign-off are complete.
