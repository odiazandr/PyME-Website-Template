import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { contextualRoutes, navigation } from "../../src/config/navigation.ts";
import { site } from "../../src/config/site.ts";
import { templateMetadata } from "../../src/data/index.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(`${root}dist/${path}`, "utf8");

// Routes are adopter-owned; the artifact path they produce is not. Derive one
// from the other rather than repeating the reference site's slugs here.
const artifactFor = (href: string) =>
  href === "/" ? "index.html" : `${href.slice(1, -1)}/index.html`;
const escapedCanonical = site.canonicalUrl.replace(
  /[.*+?^${}()|[\]\\]/g,
  "\\$&",
);

const findHtml = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory()
      ? findHtml(path)
      : entry.name.endsWith(".html")
        ? [path]
        : [];
  });

test("index output contains canonical SEO and schema.org metadata", () => {
  const html = read("index.html");
  assert.match(
    html,
    new RegExp(`<link rel="canonical" href="${escapedCanonical}/">`),
  );
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /"@type":"Organization"/);
});

test("every HTML artifact receives a restrictive hash-based CSP", () => {
  const pages = findHtml(`${root}dist`);
  assert.ok(pages.length > 0);

  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    assert.match(html, /http-equiv="content-security-policy"/, page);
    assert.match(html, /default-src 'self'/, page);
    assert.match(html, /object-src 'none'/, page);
    assert.match(html, /form-action 'self'/, page);
    assert.match(html, /script-src 'self' 'sha256-[^']+'/i, page);
    assert.match(html, /style-src 'self' 'sha256-[^']+'/i, page);
    assert.doesNotMatch(html, /'unsafe-(?:inline|eval)'/, page);
  }
});

test("immutable Astro assets use content-hashed filenames", () => {
  const assets = readdirSync(`${root}dist/_astro`, { withFileTypes: true });
  assert.ok(assets.length > 0);
  for (const asset of assets) {
    assert.ok(
      asset.isFile(),
      `unexpected directory in dist/_astro: ${asset.name}`,
    );
    assert.match(asset.name, /\.[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/i);
  }
});

test("every contextual route and the 404 page declare noindex", () => {
  const routes = Object.values(contextualRoutes);
  assert.ok(routes.length > 0, "contextual routes must not be empty");
  assert.match(read("404.html"), /content="noindex, nofollow"/);
  for (const href of routes) {
    assert.match(
      read(artifactFor(href)),
      /content="noindex, nofollow"/,
      `${href} must not be indexable`,
    );
  }
});

test("the progressive Netlify form contract holds wherever the form lives", () => {
  // Locate the form by its Netlify marker rather than by a route literal, so an
  // adopter may host it on any page.
  const hosts = findHtml(`${root}dist`).filter((page) =>
    readFileSync(page, "utf8").includes('data-netlify="true"'),
  );
  assert.equal(hosts.length, 1, "expected exactly one Netlify form page");
  const html = readFileSync(hosts[0], "utf8");

  const name = html.match(/<form name="([^"]+)"/)?.[1];
  assert.ok(name, "the form must declare a name");
  assert.match(html, /<form [^>]*method="POST"/);
  // The hidden field is what Netlify reads; it must agree with the form name.
  assert.match(html, new RegExp(`name="form-name" value="${name}"`));
  assert.match(
    html,
    new RegExp(`<form [^>]*action="${contextualRoutes.formSuccess}"`),
    "the form must post to the registered success route",
  );
  assert.match(html, /netlify-honeypot="bot-field"/);
  assert.match(html, new RegExp(`href="${contextualRoutes.privacy}"`));
});

test("robots and sitemap expose exactly the primary navigation routes", () => {
  const robots = read("robots.txt");
  const sitemap = read("sitemap-0.xml");
  assert.match(robots, new RegExp(`Disallow: ${contextualRoutes.formSuccess}`));
  assert.match(
    robots,
    new RegExp(`Sitemap: ${escapedCanonical}/sitemap-index\\.xml`),
  );
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.ok(navigation.length > 0, "navigation must not be empty");
  assert.deepEqual(
    locations.sort(),
    navigation.map(({ href }) => `${site.canonicalUrl}${href}`).sort(),
  );
});

test("public manifest contains only the stable interoperability contract", () => {
  const manifest = JSON.parse(read(".well-known/pyme-site.json"));
  assert.deepEqual(Object.keys(manifest).sort(), [
    "canonicalUrl",
    "schemaVersion",
    "siteId",
    "templateVersion",
  ]);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.templateVersion, templateMetadata.templateVersion);
  assert.equal(manifest.canonicalUrl, site.canonicalUrl);
});
