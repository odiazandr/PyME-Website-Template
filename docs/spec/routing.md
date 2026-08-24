---
owner: docs/spec/routing.md
authority: canonical
status: active
answers: ["How are public routes and URLs governed?"]
---
# Routing

Routes are explicit Astro page files rather than records in a homemade page-builder schema. URLs use stable, readable, locale-appropriate slugs. `src/config/navigation.ts` is the single owner of primary navigation, and a deterministic contract test verifies that every configured destination has an explicit page.

The implemented reference routes are `/`, `/nosotros/`, `/servicios/`, `/contacto/`, `/aviso-de-privacidad/`, `/gracias/`, and the static `404` page. The first four form primary navigation; privacy and recovery destinations remain contextual links. `/.well-known/pyme-site.json` is the deliberately small public machine interface and is generated from validated canonical identity data.

The Astro sitemap integration publishes canonical public routes and excludes the noindex thank-you and reference privacy routes. `robots.txt` points to the sitemap and disallows the thank-you route. The production gate resolves every internal `href` and `src` found in generated HTML against the final artifact.
