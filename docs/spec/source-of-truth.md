---
owner: docs/spec/source-of-truth.md
authority: canonical
status: active
answers: ["Where will each website fact live?"]
---
# Source of truth

Implemented repository-level ownership:

| Fact | Canonical owner |
|---|---|
| Current implementation phase and capability evidence level | `project-state.json` |
| Direct runtime dependencies and npm commands | `package.json` |
| Complete resolved npm dependency graph | `package-lock.json` |
| Astro build mode and integration configuration | `astro.config.ts` |
| TypeScript compiler policy | `tsconfig.json` |
| Business identity and contact | `src/data/business.json` |
| Canonical domain, locale, and stable site ID | `src/config/site.ts` |
| Locations and hours | `src/data/locations.json` |
| Services | `src/data/services.json` |
| Team publication records | `src/data/team.json` |
| Approved testimonials | `src/data/testimonials.json` |
| Social accounts | `src/data/social.json` |
| Template version | `src/data/template.json` |
| Data validation contracts | `src/schemas/*.ts` |
| Portable implemented visual contract | `DESIGN.md` |
| Runtime design tokens | `src/styles/tokens.css` |
| Design-tool extensions derived from the implementation | `.impeccable/design.json` |
| Primary navigation | `src/config/navigation.ts` |
| Build-time feature availability | `src/config/features.ts` |
| Explicit public page composition | `src/pages/*.astro` |
| Page metadata and canonical generation | `src/components/core/SEOHead.astro` |
| Structured-data shape and safe serialization | `src/components/core/StructuredData.astro`, `src/utils/structured-data.ts` |
| Privacy notice text | `src/content/legal/aviso-de-privacidad.md` |
| Contact-form field and provider contract | `src/components/forms/ContactForm.astro` |
| Generated content security policy | `astro.config.ts` |
| Hosting build, stable response headers, and hashed-asset caching | `netlify.toml` |

Planned ownership after later runtime implementation:

| Fact | Canonical owner |
|---|---|
| Public interoperability schema | `schemas/public-manifest.schema.json` |

Until planned files exist, their rows define intended ownership, not implemented data. If external JSON Schemas are later needed, they are generated from the Zod contracts and remain derived artifacts.
