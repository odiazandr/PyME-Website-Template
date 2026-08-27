import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  contactRoute,
  contextualRoutes,
  navigation,
} from "../../src/config/navigation.ts";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

function pageFileFor(href: string): string {
  const route = href === "/" ? "index" : href.replaceAll("/", "");
  return `${projectRoot}src/pages/${route}.astro`;
}

test("primary navigation has unique, local, trailing-slash routes", () => {
  const hrefs = navigation.map(({ href }) => href);

  // Guard before iterating: every assertion below lives inside a loop, so an
  // empty navigation array would satisfy this test without checking anything.
  assert.ok(navigation.length > 0, "navigation must not be empty");
  assert.equal(new Set(hrefs).size, hrefs.length);
  for (const { href, label } of navigation) {
    assert.match(href, /^\/(?:[a-z0-9-]+\/)?$/);
    assert.ok(label.trim().length > 0);
  }
});

test("every primary navigation route has an explicit Astro page", () => {
  assert.ok(navigation.length > 0, "navigation must not be empty");
  for (const { href } of navigation) {
    assert.ok(existsSync(pageFileFor(href)), `missing page for ${href}`);
  }
});

// Derived from the route registry rather than a literal list: this repository is
// a template whose adopters are expected to change slugs, so the contract is
// "every registered route resolves", not "these particular Spanish slugs exist".
test("every contextual route has an explicit Astro page", () => {
  const routes = Object.values(contextualRoutes);
  assert.ok(routes.length > 0, "contextual routes must not be empty");
  for (const href of routes) {
    assert.match(href, /^\/[a-z0-9-]+\/$/);
    assert.ok(existsSync(pageFileFor(href)), `missing page for ${href}`);
  }
});

test("contextual routes are disjoint from primary navigation", () => {
  const primary = new Set(navigation.map(({ href }) => href));
  for (const href of Object.values(contextualRoutes)) {
    assert.ok(
      !primary.has(href),
      `${href} is registered as both contextual and primary navigation`,
    );
  }
});

test("the named contact route is a registered navigation route", () => {
  const primary = navigation.map(({ href }) => href) as readonly string[];
  assert.ok(
    primary.includes(contactRoute),
    `${contactRoute} must remain part of primary navigation`,
  );
});

// Astro resolves this filename by convention, so it is a structural requirement
// rather than an adopter-owned slug.
test("the static 404 page exists", () => {
  assert.ok(existsSync(`${projectRoot}src/pages/404.astro`));
});
