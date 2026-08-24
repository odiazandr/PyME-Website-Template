---
owner: docs/spec/ownership-boundary.md
authority: canonical
status: active
answers: ["What does Project 1 own?", "What is reserved for Project 2?"]
---
# Ownership boundary

Project 1 owns website architecture and source, business-data contracts, design and component systems, public content, SEO, accessibility, security defaults, privacy integration, forms, build, validation, repository workflow, deployment contract, documentation, memory, versioning, migrations, and the non-secret public manifest.

Project 2 owns portfolio inventory, CRM and billing concerns, provider credentials, automated repository or Netlify provisioning, cross-client monitoring, centralized maintenance scheduling, and portfolio alerts.

Project 2 may observe GitHub, Netlify, DNS, and the public manifest. Project 1 never calls or requires Project 2. Credentials, contracts, billing, registrar access, and internal client notes do not belong in the website repository.

The canonical Git repository identity is separately owned by `docs/spec/repository-identity.md`.
