---
owner: docs/spec/content-model.md
authority: canonical
status: active
answers: ["What business data domains will exist?", "What content may agents create?"]
---
# Content model

Planned domains are Business, Service, Location, TeamMember, Testimonial, SocialAccount, NavigationItem, SEO metadata, and LegalDocument. Data files contain facts, not HTML, secrets, internal notes, or unapproved personal data.

Reusable facts are stored once and consumed everywhere. Schemas validate shape and semantics before components consume data. Testimonials require explicit approval. Unknown business claims remain explicit placeholders or verification requests; agents never interpolate them creatively.
