---
owner: docs/runbooks/populate-business-data.md
authority: canonical
status: active
answers: ["How are business facts populated and verified?"]
---
# Populate business data

1. Collect facts from an authorized source and record unresolved conflicts outside public data files.
2. Update each fact once in its owner under `src/data/` or, for canonical URL, locale, and site ID, `src/config/site.ts`.
3. Set `approvedForPublication` on a location or service only after a person has checked that record against reality; leave team members and testimonials out entirely until approval is explicit. Never change the flag merely to pass validation.
4. Run `npm run validate:data`, then `npm run quality`.
5. Inspect every consuming surface for consistency.

Never infer missing claims. Keep secrets, internal notes, and unapproved personal data outside the repository. Development sample values are distribution sentinels, not verified client facts; later production validation is responsible for rejecting them.
