---
owner: docs/spec/content-model.md
authority: canonical
status: active
answers: ["What business data domains will exist?", "What content may agents create?"]
---

# Content model

The implemented canonical data domains are business identity/contact, services, locations/hours, team members, testimonials, social accounts, production approvals, site identity/configuration, template metadata, and non-sensitive operations-readiness attestations. Public-site JSON data lives in `src/data/`; `operations-readiness.json` is repository-only and must not be consumed by browser-visible code. Site identity and canonical URL live in `src/config/site.ts`. Zod contracts in `src/schemas/` are the sole manually maintained schemas.

All domain objects are strict: unknown properties fail validation. Identifiers use lowercase kebab case without empty segments, phone values use E.164, the canonical URL uses HTTPS, the default locale is `es-MX`, and template versions use numeric semantic versioning without leading zeroes. Services and locations require unique IDs. A location contains exactly one entry for every weekday; open days require both times, same-day opening must precede closing, and closed days require neither. Overnight hours are not represented by this schema. Coordinates are provided together or omitted together.

Every location, service, team member, and testimonial carries `approvedForPublication`. Team members and testimonials may be absent, but any stored entry must set it to `true`; locations and services always exist, so they store the flag and production validation refuses to publish a record whose flag is `false`. A published location that is closed on all seven days is rejected as unreplaced reference data. `production.json` records three explicit launch assertions: business facts were verified, domain ownership was verified, and the privacy notice was approved. Agents must not set any approval flag without corresponding human or operational evidence; a flag records that verification occurred but cannot itself prove the external event.

Data files contain facts, not HTML, secrets, internal notes, or unapproved personal data. `operations-readiness.json` records only human attestations, never the identities or procedures behind them. Reusable facts are stored once and consumed everywhere. Unknown business claims remain unresolved or are requested from an authorized source; agents never interpolate them creatively.

Navigation is owned by `src/config/navigation.ts`, page SEO output by `SEOHead`, and legal privacy content by `src/content/legal/aviso-de-privacidad.md`. Editorial collections remain planned until a verified publishing requirement exists.
