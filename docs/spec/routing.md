---
owner: docs/spec/routing.md
authority: canonical
status: active
answers: ["How are public routes and URLs governed?"]
---
# Routing

Routes are explicit Astro page files rather than records in a homemade page-builder schema. URLs use stable, readable, locale-appropriate slugs. `src/config/navigation.ts` is the single owner of the public route registry: `navigation` holds primary navigation, and `contextualRoutes` holds the public routes reached from context rather than from the header. Deterministic contract tests verify that every registered route has an explicit page, that the two sets are disjoint, and that the built artifact matches the registry.

No consumer may repeat a registered slug. The sitemap exclusion, the `robots.txt` disallow, the contact form's success action, and every privacy link read their values from the registry, so changing a slug is a one-file edit. Tests assert the structural rule rather than the reference site's particular slugs, because an adopted client repository is expected to change them.

The implemented reference routes are `/`, `/nosotros/`, `/servicios/`, `/contacto/`, `/aviso-de-privacidad/`, `/gracias/`, and the static `404` page. The first four form primary navigation; privacy and recovery destinations are the contextual routes. `404.astro` is resolved by Astro convention and is therefore a structural filename rather than an adopter-owned slug. `/.well-known/pyme-site.json` is the deliberately small public machine interface and is generated from validated canonical identity data.

The Astro sitemap integration publishes primary navigation routes and excludes every contextual route, each of which serves noindex. `robots.txt` points to the sitemap and disallows the form-success route. The production gate resolves every internal `href` and `src` found in generated HTML against the final artifact.
