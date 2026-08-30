---
owner: docs/spec/privacy.md
authority: canonical
status: active
answers: ["What is the default privacy posture?", "How is Mexican privacy notice integration handled?"]
---

# Privacy

The default posture is data minimization: no analytics, ad pixels, personalization, social feeds, or unnecessary cookies. Collect only data required for a stated business purpose.

`src/content/legal/aviso-de-privacidad.md` is the implemented canonical owner for client-approved privacy text. Its template content is explicitly unapproved, carries `noindex`, and must be replaced and reviewed before production. The contact form links to that route and warns against sensitive data. The foundation supplies placement, data-flow, and review procedures—not legal advice or fabricated legal text. Provider retention and deletion procedures must be documented when forms or integrations store submissions. The operations-readiness gate records that a privacy contact, retention policy, and deletion owner were confirmed, without storing private operational details in the repository.
