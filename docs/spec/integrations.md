---
owner: docs/spec/integrations.md
authority: canonical
status: active
answers: ["What review is required for third-party integrations?"]
---
# Integrations

Every integration documents the business need, data leaving the site, contacted domains, cookies, scripts or iframes, CSP changes, privacy implications, performance cost, provider outage behavior, and replacement path.

The implemented CSP fails closed for unlisted external origins. An agent must not weaken or remove the policy to make an integration work; it adds only the provider origins and resource directives justified by the reviewed data flow.

Prefer ordinary links over embeds, external booking over a custom scheduler, hosted checkout over custom payment processing, and content-focused CMS integration over surrendering layout or security ownership. Analytics is absent by default.
