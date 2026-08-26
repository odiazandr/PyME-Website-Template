---
owner: docs/runbooks/add-service.md
authority: canonical
status: active
answers: ["How is a business service added?"]
---
# Add a service

Verify the service name and description, update the canonical services domain, set `approvedForPublication` once a person has confirmed the record, then run `npm run validate:data` and `npm run quality` and review every derived surface: the services page, the homepage list, navigation when justified, structured data, and the sitemap. Create a detail route only when substantial useful content exists; do not generate thin SEO pages.
