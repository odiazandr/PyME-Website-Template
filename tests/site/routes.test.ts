import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { navigation } from "../../src/config/navigation.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

function pageFileFor(href: string): string {
  const route = href === "/" ? "index" : href.replaceAll("/", "");
  return `${projectRoot}src/pages/${route}.astro`;
}

test("primary navigation has unique, local, trailing-slash routes", () => {
  const hrefs = navigation.map(({ href }) => href);

  assert.equal(new Set(hrefs).size, hrefs.length);
  for (const { href, label } of navigation) {
    assert.match(href, /^\/(?:[a-z0-9-]+\/)?$/);
    assert.ok(label.trim().length > 0);
  }
});

test("every primary navigation route has an explicit Astro page", () => {
  for (const { href } of navigation) {
    assert.ok(existsSync(pageFileFor(href)), `missing page for ${href}`);
  }
});

test("the required Phase 5 reference routes exist", () => {
  const requiredPages = [
    "index.astro",
    "nosotros.astro",
    "servicios.astro",
    "contacto.astro",
    "aviso-de-privacidad.astro",
    "gracias.astro",
    "404.astro",
  ];

  for (const page of requiredPages) {
    assert.ok(existsSync(`${projectRoot}src/pages/${page}`), `missing ${page}`);
  }
});
