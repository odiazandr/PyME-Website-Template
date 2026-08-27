import { expect, test } from "@playwright/test";

import {
  contactRoute,
  contextualRoutes,
  navigation,
} from "../../src/config/navigation.ts";

test("homepage exposes the primary journey and stable manifest", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Negocio de ejemplo",
  );
  await expect(page.getByRole("link", { name: "Contactar" })).toHaveAttribute(
    "href",
    contactRoute,
  );
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);

  const response = await request.get("/.well-known/pyme-site.json");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    schemaVersion: 1,
    siteId: "00000000-0000-4000-8000-000000000000",
    templateVersion: "0.3.0",
    canonicalUrl: "https://example.com",
  });

  await testInfo.attach("homepage", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("primary navigation reaches every explicit destination", async ({
  page,
}) => {
  expect(navigation.length).toBeGreaterThan(0);

  for (const { label, href: route } of navigation) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("valid contact data follows the provider-compatible POST contract", async ({
  page,
}) => {
  let payload = "";
  await page.route(`**${contextualRoutes.formSuccess}`, async (route) => {
    payload = route.request().postData() ?? "";
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "Gracias",
    });
  });
  await page.goto(contactRoute);
  await page.getByLabel("Nombre").fill("Persona de prueba");
  await page.getByLabel("Correo electrónico").fill("persona@example.test");
  await page
    .getByLabel("Consulta general")
    .fill("Solicito información general.");
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  expect(payload).toContain("form-name=contacto");
  expect(payload).toContain("nombre=Persona+de+prueba");
  expect(payload).toContain("correo=persona%40example.test");
  expect(payload).toContain("mensaje=Solicito+informaci%C3%B3n+general.");
});

test("contact form keeps native validation and privacy context", async ({
  page,
}, testInfo) => {
  await page.goto(contactRoute);
  const form = page.locator('form[name="contacto"]');
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).toHaveAttribute("action", contextualRoutes.formSuccess);
  await expect(page.getByLabel("Nombre")).toHaveAttribute("required", "");
  await expect(page.getByLabel("Correo electrónico")).toHaveAttribute(
    "type",
    "email",
  );
  await expect(
    form.getByRole("link", { name: "aviso de privacidad", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.getByLabel("Nombre")).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`${contactRoute}$`));

  await testInfo.attach("contact", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("skip link moves keyboard focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /saltar al contenido/i });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("unknown routes return the custom 404 without horizontal overflow", async ({
  page,
}) => {
  const response = await page.goto("/ruta-inexistente/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "encontrada",
  );
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
