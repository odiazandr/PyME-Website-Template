import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { contextualRoutes, navigation } from "../src/config/navigation.ts";
import { site } from "../src/config/site.ts";
import { templateMetadata } from "../src/data/index.ts";
import { PublicManifestSchema } from "../src/schemas/public-manifest.ts";
import {
  ROOT,
  isMain,
  readUtf8,
  report,
  type Finding,
} from "./lib/validation.ts";

// Derived from the route registry so that renaming a slug stays a one-file edit.
// Only the convention-resolved and generated artifacts are named literally.
const artifactFor = (href: string) =>
  href === "/" ? "index.html" : `${href.slice(1, -1)}/index.html`;

const required = [
  ...navigation.map(({ href }) => artifactFor(href)),
  ...Object.values(contextualRoutes).map(artifactFor),
  "404.html",
  "robots.txt",
  "sitemap-index.xml",
  "sitemap-0.xml",
  ".well-known/pyme-site.json",
];

export const verifyDist = (): Finding[] => {
  const findings: Finding[] = [];
  for (const path of required) {
    if (!existsSync(resolve(ROOT, "dist", path))) {
      findings.push({
        code: "ARTIFACT_MISSING",
        path: `dist/${path}`,
        message: "required production artifact is missing",
      });
    }
  }
  if (findings.length > 0) return findings;

  const manifestPath = resolve(ROOT, "dist/.well-known/pyme-site.json");
  try {
    const manifest = PublicManifestSchema.parse(
      JSON.parse(readUtf8(manifestPath)),
    );
    if (manifest.siteId !== site.siteId) {
      findings.push({
        code: "MANIFEST_SITE_ID",
        path: "dist/.well-known/pyme-site.json",
        message: "siteId differs from canonical site configuration",
      });
    }
    if (manifest.templateVersion !== templateMetadata.templateVersion) {
      findings.push({
        code: "MANIFEST_TEMPLATE_VERSION",
        path: "dist/.well-known/pyme-site.json",
        message: "templateVersion differs from canonical template metadata",
      });
    }
    if (manifest.canonicalUrl !== site.canonicalUrl) {
      findings.push({
        code: "MANIFEST_CANONICAL",
        path: "dist/.well-known/pyme-site.json",
        message: "canonicalUrl differs from canonical site configuration",
      });
    }
  } catch (error) {
    findings.push({
      code: "MANIFEST_INVALID",
      path: "dist/.well-known/pyme-site.json",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  const index = readUtf8(resolve(ROOT, "dist/index.html"));
  if (!index.includes(`<link rel="canonical" href="${site.canonicalUrl}/">`)) {
    findings.push({
      code: "CANONICAL_MISMATCH",
      path: "dist/index.html",
      message: "homepage canonical does not match site configuration",
    });
  }
  const robots = readUtf8(resolve(ROOT, "dist/robots.txt"));
  if (!robots.includes(`Sitemap: ${site.canonicalUrl}/sitemap-index.xml`)) {
    findings.push({
      code: "ROBOTS_SITEMAP",
      path: "dist/robots.txt",
      message: "robots sitemap URL does not match site configuration",
    });
  }
  return findings;
};

if (isMain(import.meta.url)) {
  report("DIST VERIFICATION", verifyDist());
}
