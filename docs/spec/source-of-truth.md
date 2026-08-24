---
owner: docs/spec/source-of-truth.md
authority: canonical
status: active
answers: ["Where will each website fact live?"]
---
# Source of truth

Planned ownership after runtime implementation:

| Fact | Canonical owner |
|---|---|
| Business identity and contact | `src/data/business.json` |
| Canonical domain and locale | `src/config/site.ts` |
| Locations and hours | `src/data/locations.json` |
| Services | `src/data/services.json` |
| Team | `src/data/team.json` |
| Approved testimonials | `src/data/testimonials.json` |
| Navigation | `src/config/navigation.ts` |
| Build-time features | `src/config/features.ts` |
| Template version | `src/data/template.json` |
| Design values | `src/styles/tokens.css` |
| Privacy text | `src/content/legal/aviso-de-privacidad.md` |
| Public interoperability schema | `schemas/public-manifest.schema.json` |

Until those files exist, this table defines intended ownership, not implemented data.
