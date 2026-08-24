---
owner: docs/spec/routing.md
authority: canonical
status: active
answers: ["How are public routes and URLs governed?"]
---
# Routing

Routes are explicit Astro page files rather than records in a homemade page-builder schema. URLs use stable, readable, locale-appropriate slugs. `src/config/navigation.ts` is the single owner of primary navigation, and a deterministic contract test verifies that every configured destination has an explicit page.

The implemented reference routes are `/`, `/nosotros/`, `/servicios/`, `/contacto/`, `/aviso-de-privacidad/`, `/gracias/`, and the static `404` page. The first four form primary navigation; privacy and recovery destinations remain contextual links.

Sitemap generation and built-output link validation remain Phase 6 and Phase 8 work. Thank-you, preview, draft, and internal utility routes will be excluded from public sitemap output where appropriate.
