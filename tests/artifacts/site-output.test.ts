import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path: string) => readFileSync(`${root}dist/${path}`, "utf8");

test("index output contains canonical SEO and schema.org metadata", () => {
  const html = read("index.html");
  assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/">/);
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /"@type":"Organization"/);
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
