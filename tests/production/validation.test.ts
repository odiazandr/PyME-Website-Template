import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { evaluateProduction } from "../../scripts/validate-production.ts";
import { scanPublicText } from "../../scripts/check-public-output.ts";
import {
  extractReferences,
  resolveReference,
} from "../../scripts/check-links.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const run = (script: string) =>
  spawnSync(process.execPath, [`scripts/${script}.ts`], {
    cwd: root,
    encoding: "utf8",
  });

for (const script of [
  "validate-project",
  "check-placeholders",
  "check-assets",
  "verify-dist",
  "check-links",
]) {
  test(`${script} accepts the reference template within its scope`, () => {
    const result = run(script);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
}

test("production source validation rejects the uninitialized template", () => {
  const result = run("validate-production");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /PROJECT_MODE_REQUIRED/);
  assert.match(result.stderr, /SAMPLE_VALUE/);
  assert.match(result.stderr, /PRIVACY_UNAPPROVED/);
});

test("public-output validation rejects sample identity leakage", () => {
  const result = run("check-public-output");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /EXAMPLE_DOMAIN_LEAK/);
  assert.match(result.stderr, /SAMPLE_IDENTITY_LEAK/);
  assert.match(result.stderr, /ZERO_SITE_ID_LEAK/);
});

test("production evaluation accepts a completed client state", () => {
  assert.deepEqual(
    evaluateProduction({
      mode: "project",
      facts: {
        business: {
          publicName: "Taller Nopal",
          email: "hola@tallernopal.mx",
          description: "Carpintería local con información verificada.",
        },
        site: {
          siteId: "2250c019-ae4a-4f19-b152-873f14a4ce0a",
          canonicalUrl: "https://tallernopal.mx",
        },
      },
      canonicalUrl: "https://tallernopal.mx",
      privacyText: "Aviso aprobado por la persona responsable.",
      approvals: {
        businessFactsVerified: true,
        domainOwnershipVerified: true,
        privacyNoticeApproved: true,
      },
    }),
    [],
  );
});

test("production evaluation requires explicit operational approvals", () => {
  const findings = evaluateProduction({
    mode: "project",
    facts: { business: { publicName: "Taller Nopal" } },
    canonicalUrl: "https://tallernopal.mx",
    privacyText: "Texto legal completo proporcionado por el cliente.",
    approvals: {
      businessFactsVerified: false,
      domainOwnershipVerified: false,
      privacyNoticeApproved: false,
    },
  });
  assert.equal(
    findings.filter(
      (finding) => finding.code === "PRODUCTION_APPROVAL_REQUIRED",
    ).length,
    3,
  );
});

test("public text scanner detects each forbidden sentinel independently", () => {
  assert.deepEqual(scanPublicText("http://localhost:4321"), ["LOCALHOST_LEAK"]);
  assert.deepEqual(scanPublicText("https://example.org"), [
    "EXAMPLE_DOMAIN_LEAK",
  ]);
  assert.deepEqual(scanPublicText("Negocio de ejemplo"), [
    "SAMPLE_IDENTITY_LEAK",
  ]);
  assert.deepEqual(scanPublicText("@@PYME_UNRESOLVED:NAME@@"), [
    "UNRESOLVED_MARKER_LEAK",
  ]);
});

test("link extraction covers forms, single quotes, srcset, and CSS URLs", () => {
  const references = extractReferences(
    `<form action='/gracias/'><img src="/one.svg" srcset="/two.webp 1x, /three.webp 2x"><style>.x{background:url('/four.svg')}</style>`,
  );
  assert.deepEqual(references.sort(), [
    "/four.svg",
    "/gracias/",
    "/one.svg",
    "/three.webp",
    "/two.webp",
  ]);
});

test("link resolution rejects traversal and malformed encoding", () => {
  const source = `${root}dist/index.html`;
  assert.match(
    resolveReference("../package.json", source).error ?? "",
    /outside/,
  );
  assert.match(
    resolveReference("/%2e%2e/package.json", source).error ?? "",
    /outside/,
  );
  assert.match(resolveReference("/bad%ZZ", source).error ?? "", /malformed/);
});
