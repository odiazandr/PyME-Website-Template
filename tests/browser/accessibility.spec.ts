import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.use({ bypassCSP: true });

for (const route of [
  "/",
  "/nosotros/",
  "/servicios/",
  "/contacto/",
  "/aviso-de-privacidad/",
  "/gracias/",
  "/ruta-inexistente/",
]) {
  test(`@a11y ${route} has no automated WCAG violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
