---
owner: docs/spec/operations-readiness.md
authority: canonical
status: active
answers: ["What makes a client operationally ready to launch?", "Which operational facts may be recorded in the repository?"]
---

# Operations readiness

Website launch and client operations launch are separate claims. A website is deployable when its source, public content, build, artifact, and provider-facing configuration pass their applicable checks. A client is operationally ready only after the business process behind the public site has been deliberately reviewed.

`operations-readiness.json` is the canonical machine-readable checklist. It contains only boolean attestations: it must never contain names, inbox addresses, credentials, retention records, emergency procedures, or other private operational details. Those details belong in the client’s private operational systems. Each `true` records that a human performed the corresponding verification; it is not proof of the external event, and an agent may not set it without that evidence. Artifact tests enforce that the attestations never enter the public build output.

All clients require an assigned response owner, documented retention policy, assigned deletion owner, reviewed emergency language and escalation path, confirmed privacy contact, publication approver, domain-management owner, and rollback owner. When a static contact form is enabled, the checklist additionally requires an approved recipient, a monitored inbox, and a real delivery verified in that inbox.

`npm run validate:operations` validates these attestations. `npm run quality:production` remains the site-deployability gate; `npm run quality:launch` runs both gates. Neither deterministic gate replaces the authenticated provider evidence from `npm run verify:deployment`, client sign-off, or a real operating process.
