import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { contextualRoutes, navigation } from "../../src/config/navigation.ts";

test.use({ bypassCSP: true });

// Derived from the route registry: an adopter who adds or renames a route gets
// accessibility coverage for it without editing this file.
const routes = [
  ...navigation.map(({ href }) => href),
  ...Object.values(contextualRoutes),
  "/ruta-inexistente/", // deliberately unregistered, to exercise the 404 page
];

for (const route of routes) {
  test(`@a11y ${route} has no automated WCAG violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
