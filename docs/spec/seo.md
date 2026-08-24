---
owner: docs/spec/seo.md
authority: canonical
status: active
answers: ["What SEO output is required?", "How is structured data governed?"]
---
# SEO

`SEOHead` now emits a title, description, canonical URL, robots intent, and Open Graph metadata for every page from the canonical `site` configuration. The static build generates `robots.txt`, `sitemap-index.xml`, and its child sitemap. Thank-you and reference legal pages are `noindex` and excluded from the sitemap; an approved client privacy notice may become indexable only through deliberate project customization.

The home page emits safely serialized `Organization` JSON-LD from validated business and location facts. A more specific business subtype requires verified client classification; agents do not guess one. Thin pages are not created merely to multiply keywords. Post-build artifact tests verify the current metadata, robots, sitemap, and JSON-LD contracts against `dist/`.
