---
owner: docs/spec/routing.md
authority: canonical
status: active
answers: ["How are public routes and URLs governed?"]
---
# Routing

Routes are explicit Astro page files rather than records in a homemade page-builder schema. URLs use stable, readable, locale-appropriate slugs. Navigation has one configuration owner. Internal links target known routes and are validated before production.

Thank-you, preview, draft, and internal utility routes are excluded from public sitemap output where appropriate.
