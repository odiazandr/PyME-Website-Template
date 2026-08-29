import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  contactRoute,
  contextualRoutes,
  navigation,
} from "../../src/config/navigation.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));

// Adversarial validation on 2026-08-27 measured the cost of repeating a route
// slug outside its registry: renaming one route left the build green while the
// hardcoded copies in these consumers failed, which blocked both the required
// status check and the Netlify production build. This test guards the class
// rather than the individual instances, so it cannot silently come back.
const consumers = [
  "astro.config.ts",
  "scripts/verify-dist.ts",
  "src/pages/robots.txt.ts",
  "src/components/forms/ContactForm.astro",
  "src/components/forms/FormNotice.astro",
  "src/components/core/SiteFooter.astro",
  "src/components/sections/ContactCTA.astro",
  "src/pages/index.astro",
  "src/pages/servicios.astro",
  "src/pages/404.astro",
  "tests/site/routes.test.ts",
  "tests/artifacts/site-output.test.ts",
  "tests/browser/smoke.spec.ts",
  "tests/browser/accessibility.spec.ts",
];

const registeredSlugs = [
  ...navigation.map(({ href }) => href),
  ...Object.values(contextualRoutes),
  contactRoute,
]
  // "/" is not a slug anyone can accidentally hardcode meaningfully.
  .filter((href) => href !== "/");

test("no consumer repeats a slug the route registry owns", () => {
  assert.ok(registeredSlugs.length > 0, "expected registered slugs to compare");
  assert.ok(consumers.length > 0, "expected consumers to scan");

  for (const file of consumers) {
    const source = readFileSync(`${root}${file}`, "utf8");
    for (const slug of registeredSlugs) {
      assert.ok(
        !source.includes(`"${slug}"`),
        `${file} hardcodes ${slug}; import it from src/config/navigation.ts instead`,
      );
    }
  }
});

test("the route registry is the only place the slugs are written", () => {
  const registry = readFileSync(`${root}src/config/navigation.ts`, "utf8");
  for (const slug of registeredSlugs) {
    assert.ok(
      registry.includes(`"${slug}"`),
      `${slug} must be declared literally in the registry`,
    );
  }
});
