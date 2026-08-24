import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { site } from "./src/config/site.ts";

export default defineConfig({
  output: "static",
  site: site.canonicalUrl,
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return !["/gracias/", "/aviso-de-privacidad/"].includes(pathname);
      },
    }),
  ],
});
