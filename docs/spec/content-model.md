---
owner: docs/spec/content-model.md
authority: canonical
status: active
answers: ["What business data domains will exist?", "What content may agents create?"]
---
# Content model

The implemented canonical data domains are business identity/contact, services, locations/hours, team members, testimonials, social accounts, site identity/configuration, and template metadata. JSON data lives in `src/data/`; site identity and canonical URL live in `src/config/site.ts`. Zod contracts in `src/schemas/` are the sole manually maintained schemas.

All domain objects are strict: unknown properties fail validation. Identifiers use lowercase kebab case without empty segments, phone values use E.164, the canonical URL uses HTTPS, the default locale is `es-MX`, and template versions use numeric semantic versioning without leading zeroes. Services and locations require unique IDs. A location contains exactly one entry for every weekday; open days require both times, same-day opening must precede closing, and closed days require neither. Overnight hours are not represented by this schema. Coordinates are provided together or omitted together.

Team members and testimonials may be absent, but any stored entry must set `approvedForPublication` to `true`. Agents must not use that flag as a substitute for real owner approval.

Data files contain facts, not HTML, secrets, internal notes, or unapproved personal data. Reusable facts are stored once and consumed everywhere. Unknown business claims remain unresolved or are requested from an authorized source; agents never interpolate them creatively.

Navigation, page SEO metadata, legal documents, and editorial collections remain planned until their runtime owners exist.
