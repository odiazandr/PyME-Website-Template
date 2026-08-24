import type { APIRoute } from "astro";
import { site } from "../../config/site";
import { templateMetadata } from "../../data";
import { PublicManifestSchema } from "../../schemas/public-manifest";

export const GET: APIRoute = () => {
  const manifest = PublicManifestSchema.parse({
    schemaVersion: 1,
    siteId: site.siteId,
    templateVersion: templateMetadata.templateVersion,
    canonicalUrl: site.canonicalUrl,
  });

  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
