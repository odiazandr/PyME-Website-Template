import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { BusinessSchema } from "../../src/schemas/business.ts";
import { LocationsSchema } from "../../src/schemas/location.ts";
import { ServicesSchema } from "../../src/schemas/service.ts";
import { SiteSchema } from "../../src/schemas/site.ts";
import { TeamSchema } from "../../src/schemas/team.ts";
import { TemplateMetadataSchema } from "../../src/schemas/template.ts";
import { TestimonialsSchema } from "../../src/schemas/testimonial.ts";
import { site } from "../../src/config/site.ts";
import {
  business,
  locations,
  services,
  socialAccounts,
  team,
  templateMetadata,
  testimonials,
} from "../../src/data/index.ts";
import { IdentifierSchema } from "../../src/schemas/common.ts";

const validHours = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
].map((day) => ({ day, closed: false, opens: "09:00", closes: "18:00" }));

const validLocation = {
  id: "centro",
  name: "Sucursal Centro",
  street: "Calle 1",
  locality: "Puebla",
  region: "Puebla",
  postalCode: "72000",
  country: "MX",
  phone: "+522221234567",
  mapUrl: null,
  geo: { latitude: null, longitude: null },
  hours: validHours,
};

describe("business data contracts", () => {
  test("loads every canonical data fixture through validated exports", () => {
    assert.ok(business.publicName);
    assert.ok(locations.length > 0);
    assert.ok(services.length > 0);
    assert.ok(Array.isArray(socialAccounts));
    assert.ok(Array.isArray(team));
    assert.ok(templateMetadata.templateVersion);
    assert.ok(Array.isArray(testimonials));
    assert.ok(site.siteId);
  });

  test("rejects an enabled WhatsApp channel without a number", () => {
    const result = BusinessSchema.safeParse({
      schemaVersion: 1,
      publicName: "Negocio",
      legalName: null,
      description: "Descripción",
      primaryPhone: { display: "222 123 4567", e164: "+522221234567" },
      email: "contacto@example.com",
      whatsapp: { enabled: true, number: null },
    });
    assert.equal(result.success, false);
  });

  test("rejects duplicate service IDs", () => {
    const service = {
      id: "consulta",
      name: "Consulta",
      shortDescription: "Descripción",
      featured: true,
      detailPage: false,
    };
    assert.equal(ServicesSchema.safeParse([service, service]).success, false);
  });

  test("rejects missing or duplicated weekdays", () => {
    const hours = [...validHours];
    hours[6] = { ...hours[6], day: "monday" };
    assert.equal(
      LocationsSchema.safeParse([{ ...validLocation, hours }]).success,
      false,
    );
  });

  test("rejects partial coordinates and invalid open-day hours", () => {
    assert.equal(
      LocationsSchema.safeParse([
        {
          ...validLocation,
          geo: { latitude: 19.04, longitude: null },
          hours: validHours.map((hours, index) =>
            index === 0 ? { ...hours, closes: null } : hours,
          ),
        },
      ]).success,
      false,
    );
  });

  test("rejects reversed same-day business hours", () => {
    const hours = validHours.map((hours, index) =>
      index === 0 ? { ...hours, opens: "18:00", closes: "09:00" } : hours,
    );
    assert.equal(
      LocationsSchema.safeParse([{ ...validLocation, hours }]).success,
      false,
    );
  });

  test("requires publication approval for people and testimonials", () => {
    assert.equal(
      TeamSchema.safeParse([
        {
          id: "ana",
          displayName: "Ana",
          publicRole: "Directora",
          biography: null,
          image: null,
          approvedForPublication: false,
        },
      ]).success,
      false,
    );
    assert.equal(
      TestimonialsSchema.safeParse([
        {
          id: "cliente-1",
          quote: "Excelente servicio",
          displayName: "Cliente",
          sourceUrl: null,
          approvedForPublication: false,
        },
      ]).success,
      false,
    );
  });
});

describe("technical identity contracts", () => {
  test("rejects malformed kebab-case identifiers", () => {
    assert.equal(IdentifierSchema.safeParse("service-").success, false);
    assert.equal(IdentifierSchema.safeParse("service--name").success, false);
  });

  test("rejects non-HTTPS canonical URLs and malformed site IDs", () => {
    assert.equal(
      SiteSchema.safeParse({
        schemaVersion: 1,
        siteId: "not-a-uuid",
        canonicalUrl: "http://example.com",
        defaultLocale: "es-MX",
        titleTemplate: "%s | Negocio",
      }).success,
      false,
    );
  });

  test("rejects loose template versions", () => {
    assert.equal(
      TemplateMetadataSchema.safeParse({
        schemaVersion: 1,
        templateVersion: "v0.3",
      }).success,
      false,
    );
    assert.equal(
      TemplateMetadataSchema.safeParse({
        schemaVersion: 1,
        templateVersion: "01.2.3",
      }).success,
      false,
    );
  });
});
