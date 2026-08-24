import { SiteSchema } from "../schemas/site.ts";
export const site = SiteSchema.parse({
  schemaVersion: 1,
  siteId: "00000000-0000-4000-8000-000000000000",
  canonicalUrl: "https://example.com",
  defaultLocale: "es-MX",
  titleTemplate: "%s | Negocio de ejemplo",
});
