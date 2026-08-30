import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  SAMPLE_VALUES,
  evaluateProduction,
  validateProduction,
} from "../../scripts/validate-production.ts";
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
        deploymentContext: "production",
        businessFactsVerified: true,
        domainOwnershipVerified: true,
        privacyNoticeApproved: true,
      },
      locations: [],
      services: [],
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
      deploymentContext: "production",
      businessFactsVerified: false,
      domainOwnershipVerified: false,
      privacyNoticeApproved: false,
    },
    locations: [],
    services: [],
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
  assert.deepEqual(scanPublicText("Publicación: No autorizada"), [
    "REFERENCE_STATE_LEAK",
  ]);
  assert.deepEqual(scanPublicText('href="javascript:alert(1)"'), [
    "UNSAFE_URL_SCHEME_LEAK",
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
  assert.match(
    resolveReference("javascript:alert(1)", source).error ?? "",
    /forbidden javascript/,
  );
});

test("link resolution requires an index artifact for a directory", () => {
  const directory = mkdtempSync(join(tmpdir(), "pyme-links-"));
  const source = join(directory, "index.html");
  const target = join(directory, "directory-target");
  try {
    writeFileSync(source, "<a href='/directory-target'>Target</a>", "utf8");
    mkdirSync(target);
    writeFileSync(join(target, "placeholder.txt"), "not an artifact", "utf8");
    const missing = resolveReference("/directory-target", source, directory);
    assert.equal(missing.target, join(target, "index.html"));

    writeFileSync(join(target, "index.html"), "ok", "utf8");
    const resolved = resolveReference("/directory-target", source, directory);
    assert.equal(resolved.target, join(target, "index.html"));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

// --- content contract mutation resistance ---------------------------------
//
// Each case mutates one aspect of an otherwise launch-ready client state and
// asserts the specific rule that must reject it. A rule with no failing
// mutation here is a rule that could be deleted without any test noticing.

const openWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
].map((day) => ({ day, closed: false }));

const launchReady = () => ({
  mode: "project",
  facts: {
    business: { publicName: "Taller Nopal" },
    site: { canonicalUrl: "https://tallernopal.mx" },
  },
  canonicalUrl: "https://tallernopal.mx",
  privacyText: "Aviso aprobado por la persona responsable.",
  approvals: {
    deploymentContext: "production",
    businessFactsVerified: true,
    domainOwnershipVerified: true,
    privacyNoticeApproved: true,
  },
  locations: [
    {
      id: "sucursal-centro",
      approvedForPublication: true,
      hours: openWeek,
    },
  ],
  services: [{ id: "carpinteria", approvedForPublication: true }],
});

const codesFor = (mutate: (state: ReturnType<typeof launchReady>) => void) => {
  const state = launchReady();
  mutate(state);
  return evaluateProduction(state).map((finding) => finding.code);
};

test("the launch-ready baseline produces no findings", () => {
  assert.deepEqual(evaluateProduction(launchReady()), []);
});

for (const [label, mutate, expected] of [
  [
    "a rehearsal deployment context",
    (s) => (s.approvals.deploymentContext = "rehearsal"),
    "DEPLOYMENT_CONTEXT_NOT_PRODUCTION",
  ],
  [
    "an unreviewed location",
    (s) => (s.locations[0].approvedForPublication = false),
    "CONTENT_REVIEW_REQUIRED",
  ],
  [
    "an unreviewed service",
    (s) => (s.services[0].approvedForPublication = false),
    "CONTENT_REVIEW_REQUIRED",
  ],
  [
    "a published location closed all week",
    (s) =>
      (s.locations[0].hours = openWeek.map((h) => ({ ...h, closed: true }))),
    "LOCATION_NEVER_OPEN",
  ],
  [
    "a retained placeholder address",
    (s) => (s.facts.locations = [{ street: "Dirección pendiente" }]),
    "SAMPLE_VALUE",
  ],
  [
    "retained placeholder service copy",
    (s) =>
      (s.facts.services = [
        {
          shortDescription:
            "Contenido de referencia pendiente de sustituir con información verificada.",
        },
      ]),
    "SAMPLE_VALUE",
  ],
  [
    "a retained sample identity",
    (s) => (s.facts.business = { publicName: "Negocio de ejemplo" }),
    "SAMPLE_VALUE",
  ],
  [
    "a provider canonical domain",
    (s) => (s.canonicalUrl = "https://taller.netlify.app"),
    "PROVIDER_CANONICAL",
  ],
  [
    "template memory mode",
    (s) => (s.mode = "template"),
    "PROJECT_MODE_REQUIRED",
  ],
  [
    "unapproved privacy text",
    (s) => (s.privacyText = "Revisión legal pendiente."),
    "PRIVACY_UNAPPROVED",
  ],
  [
    "a withdrawn approval",
    (s) => (s.approvals.businessFactsVerified = false),
    "PRODUCTION_APPROVAL_REQUIRED",
  ],
] as [string, (s: any) => void, string][]) {
  test(`production evaluation rejects ${label}`, () => {
    assert.ok(
      codesFor(mutate).includes(expected),
      `expected ${expected} for ${label}`,
    );
  });
}

test("the distribution template cannot reach production", () => {
  const codes = validateProduction().map((finding) => finding.code);
  assert.ok(codes.includes("CONTENT_REVIEW_REQUIRED"));
  assert.ok(codes.includes("SAMPLE_VALUE"));
});

test("every registered sample value still occurs in the shipped fixtures", () => {
  // Guards the registry against silent drift: if a fixture is reworded, the rule
  // protecting it must be reworded in the same change. Only meaningful in the
  // distribution template, where those fixtures are still present.
  const memory = readFileSync(`${root}memory.toml`, "utf8");
  if (!/^mode\s*=\s*"template"\s*$/m.test(memory)) return;

  const shipped = [
    "src/data/business.json",
    "src/data/locations.json",
    "src/data/services.json",
    "src/config/site.ts",
  ]
    .map((file) => readFileSync(`${root}${file}`, "utf8"))
    .join("\n")
    .toLowerCase();

  for (const value of SAMPLE_VALUES) {
    assert.ok(
      shipped.includes(value),
      `registered sample value no longer occurs in any fixture: ${value}`,
    );
  }
});
