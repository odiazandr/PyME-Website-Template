import type { APIRoute } from "astro";
import { contextualRoutes } from "../config/navigation.ts";
import { site } from "../config/site";

export const GET: APIRoute = () => {
  const sitemap = new URL("/sitemap-index.xml", site.canonicalUrl);
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      `Disallow: ${contextualRoutes.formSuccess}`,
      `Sitemap: ${sitemap}`,
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
