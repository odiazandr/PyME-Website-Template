---
owner: docs/decisions/0113-derived-route-contracts.md
authority: canonical
status: active
answers: ["Why do route contracts derive from one registry?"]
---
# 0113 — Derived route contracts

## Status

Accepted.

## Context

Adversarial validation on 2026-08-27 measured a defect that no gate could report. Renaming one route slug — a change `docs/spec/routing.md` explicitly sanctions, applied through the navigation config it names as the single owner — left `astro check` at zero errors and the build succeeding, while two test files failed on hardcoded literals.

The consequence was larger than a red test. `test:artifacts` is part of `npm run quality`, and `npm run quality` is both the required `Quality and contracts` status check and the `netlify.toml` build command. A correct, documented customization therefore blocked the merge under the default-branch ruleset *and* failed the production build. An adopter following the runbooks could not deploy, and nothing in the adoption procedure pointed at the cause.

The same pattern appeared in six places. Two contextual slugs were additionally repeated across six source locations, which is a duplicate authority under invariant 3 in its own right: the sitemap filter, the `robots.txt` disallow, the form action, and three privacy links each carried their own copy.

This repository is a template product. Its purpose is to be adopted and customized. A test that pins a value an adopter is expected to change is not protecting an invariant; it is encoding the reference site's preferences as a requirement.

## Decision

`src/config/navigation.ts` owns the complete public route registry — `navigation` for primary navigation and `contextualRoutes` for routes reached from context. Navigation entries carry stable identifiers so that a consumer can name a route without repeating its slug; `routeFor` resolves an identifier and throws on an unknown one.

Every consumer derives from it. No sitemap filter, robots directive, form action, page link, validation script, or test repeats a registered slug.

Contract tests assert structural rules — every registered route resolves, the two sets are disjoint, the sitemap contains exactly the primary routes, each contextual route serves noindex, the form's hidden field agrees with its name and it posts to the registered success route — rather than the reference site's particular slugs. The Netlify form is located in the built output by its marker rather than by a route literal.

Where a literal genuinely belongs to the distribution template rather than to an adopter, the assertion is gated on `memory.toml` mode being `template`, the pattern already used in `tests/production/validation.test.ts`.

`404.astro` remains pinned: Astro resolves it by convention, so it is structural rather than adopter-owned.

## Consequences

Changing a slug is a one-file edit and the development gate stays green. This was verified by renaming both a primary and a contextual slug in a disposable copy and running the gate; the rename propagated to the sitemap, the form action, the built directory names, and the required artifact list with no other file touched.

`tests/site/route-ownership.test.ts` guards the class rather than the individual instances: it asserts that no listed consumer contains a registered slug literal, and that the registry does. It was validated with a negative control — reintroducing one hardcoded action fails it with a message naming the file and the slug.

The tests now protect a weaker set of literals and a stronger set of rules. They no longer prove the reference site says `Nosotros`; they prove that whatever routes exist are registered, reachable, correctly indexed, and consistent between source and artifact. That is the property worth protecting in a template.

Consumers gain an import edge to `src/config/navigation.ts`, including `astro.config.ts`. This is accepted: the registry has no dependencies of its own.
