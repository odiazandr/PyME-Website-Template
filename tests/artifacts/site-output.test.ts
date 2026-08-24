import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(`${root}dist/${path}`, "utf8");

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
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/">/);
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

test("non-indexable utility pages declare noindex", () => {
  assert.match(read("404.html"), /content="noindex, nofollow"/);
  assert.match(read("gracias/index.html"), /content="noindex, nofollow"/);
  assert.match(
    read("aviso-de-privacidad/index.html"),
    /content="noindex, nofollow"/,
  );
});

test("contact output contains the progressive Netlify form contract", () => {
  const html = read("contacto/index.html");
  assert.match(
    html,
    /<form name="contacto" method="POST" action="\/gracias\/" data-netlify="true"/,
  );
  assert.match(html, /name="form-name" value="contacto"/);
  assert.match(html, /netlify-honeypot="bot-field"/);
  assert.match(html, /href="\/aviso-de-privacidad\/"/);
});

test("robots and sitemap expose only intended public routes", () => {
  const robots = read("robots.txt");
  const sitemap = read("sitemap-0.xml");
  assert.match(robots, /Disallow: \/gracias\//);
  assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap-index\.xml/);
  assert.doesNotMatch(sitemap, /\/gracias\//);
  assert.doesNotMatch(sitemap, /\/aviso-de-privacidad\//);
  assert.match(sitemap, /https:\/\/example\.com\/contacto\//);
});
