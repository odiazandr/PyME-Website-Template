---
owner: docs/spec/website-validation.md
authority: canonical
status: active
answers: ["Which checks gate development and production?", "What must built-output validation inspect?"]
---
# Website validation

Fast deterministic checks will cover memory health, formatting, Astro checking, schema validation, placeholder and domain validation, build, built-output verification, asset policy, public-output scanning, and internal links. Browser QA will cover critical routes, navigation, forms, 404 behavior, CTAs, keyboard interaction, and severe automated accessibility violations.

Production checks reject unresolved placeholders, sample identities, localhost or provider subdomain canonicals, invalid business data, missing required pages, invalid manifests, incorrect robots or sitemap output, and suspicious dummy strings. Validation inspects `dist/`, not source alone. Missing checks remain `UNVERIFIED`.
