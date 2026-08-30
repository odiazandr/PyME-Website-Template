import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  formatSource,
  acquireInitializationLock,
  parseArguments,
  parseInput,
  planInitialization,
  readMode,
  renderBusinessData,
  renderSiteConfig,
  setProjectMode,
  type InitContext,
} from "../../scripts/init-client.ts";
import { commitFileTransaction } from "../../scripts/lib/file-transaction.ts";
import { business } from "../../src/data/index.ts";
import { site } from "../../src/config/site.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));

const clientInput = {
  schemaVersion: 1 as const,
  site: { canonicalUrl: "https://tallernopal.mx" },
  business: {
    schemaVersion: 1 as const,
    publicName: "Taller Nopal",
    legalName: null,
    description: "Carpinteria local especializada en muebles a medida.",
    primaryPhone: { display: "+52 222 123 4567", e164: "+522221234567" },
    email: "hola@tallernopal.mx",
    whatsapp: { enabled: false, number: null },
  },
};

const context = (overrides: Partial<InitContext> = {}): InitContext => ({
  input: clientInput,
  mode: "template",
  generatedSiteId: "aedc8c8b-948a-447b-9c73-f18521ea0915",
  privacyText: "Aviso aprobado por la persona responsable del negocio.",
  approvals: {
    deploymentContext: "production",
    businessFactsVerified: true,
    domainOwnershipVerified: true,
    privacyNoticeApproved: true,
  },
  recordedTemplateVersion: "0.3.0",
  packageVersion: "0.3.0",
  force: false,
  existingSiteId: null,
  newIdentity: false,
  locations: [],
  services: [],
  ...overrides,
});

const codes = (findings: { code: string }[]): string[] =>
  findings.map((finding) => finding.code).sort();

test("initialization derives site identity from verified input", () => {
  const plan = planInitialization(context());
  assert.deepEqual(plan.findings, []);
  assert.equal(plan.site.siteId, "aedc8c8b-948a-447b-9c73-f18521ea0915");
  assert.equal(plan.site.canonicalUrl, "https://tallernopal.mx");
  assert.equal(plan.site.titleTemplate, "%s | Taller Nopal");
  assert.equal(plan.site.defaultLocale, "es-MX");
});

test("initialization preserves an explicitly supplied site identity", () => {
  const plan = planInitialization(
    context({
      input: {
        ...clientInput,
        site: {
          siteId: "2250c019-ae4a-4f19-b152-873f14a4ce0a",
          canonicalUrl: "https://tallernopal.mx",
          titleTemplate: "%s — Taller Nopal",
        },
      },
    }),
  );
  assert.deepEqual(plan.findings, []);
  assert.equal(plan.site.siteId, "2250c019-ae4a-4f19-b152-873f14a4ce0a");
  assert.equal(plan.site.titleTemplate, "%s — Taller Nopal");
});

test("initialization refuses every sample identity value", () => {
  for (const [field, input] of [
    [
      "canonicalUrl",
      { ...clientInput, site: { canonicalUrl: "https://example.com" } },
    ],
    [
      "publicName",
      {
        ...clientInput,
        business: { ...clientInput.business, publicName: "Negocio de ejemplo" },
      },
    ],
    [
      "description",
      {
        ...clientInput,
        business: {
          ...clientInput.business,
          description: "Descripción pendiente de verificación del cliente.",
        },
      },
    ],
    [
      "siteId",
      {
        ...clientInput,
        site: {
          siteId: "00000000-0000-4000-8000-000000000000",
          canonicalUrl: "https://tallernopal.mx",
        },
      },
    ],
  ] as const) {
    const plan = planInitialization(context({ input }));
    assert.ok(
      plan.findings.some((finding) => finding.code === "SAMPLE_VALUE"),
      `${field} should have been rejected as a sample value`,
    );
  }
});

test("initialization refuses a provider canonical domain", () => {
  const plan = planInitialization(
    context({
      input: {
        ...clientInput,
        site: { canonicalUrl: "https://taller-nopal.netlify.app" },
      },
    }),
  );
  assert.deepEqual(codes(plan.findings), ["PROVIDER_CANONICAL"]);
});

test("initialization refuses to overwrite an initialized repository", () => {
  assert.deepEqual(
    codes(planInitialization(context({ mode: "project" })).findings),
    ["ALREADY_INITIALIZED"],
  );
  assert.deepEqual(
    planInitialization(context({ mode: "project", force: true })).findings,
    [],
  );
});

test("initialization refuses an unreadable memory mode", () => {
  assert.deepEqual(
    codes(planInitialization(context({ mode: null })).findings),
    ["MEMORY_MODE_UNREADABLE"],
  );
});

test("initialization refuses a drifted template version record", () => {
  assert.deepEqual(
    codes(
      planInitialization(context({ recordedTemplateVersion: "0.2.0" }))
        .findings,
    ),
    ["TEMPLATE_VERSION_MISMATCH"],
  );
});

test("initialization never self-approves human verification", () => {
  const plan = planInitialization(
    context({
      privacyText: "## Revisión legal pendiente",
      approvals: {
        deploymentContext: "production",
        businessFactsVerified: false,
        domainOwnershipVerified: false,
        privacyNoticeApproved: false,
      },
    }),
  );
  assert.deepEqual(plan.findings, []);
  assert.deepEqual(codes(plan.deferred), [
    "PRIVACY_UNAPPROVED",
    "PRODUCTION_APPROVAL_REQUIRED",
    "PRODUCTION_APPROVAL_REQUIRED",
    "PRODUCTION_APPROVAL_REQUIRED",
  ]);
});

test("project mode rewrite preserves surrounding configuration", () => {
  const memory = readFileSync(`${root}memory.toml`, "utf8");
  const rewritten = setProjectMode(memory) as string;
  assert.equal(readMode(memory), "template");
  assert.equal(readMode(rewritten), "project");
  assert.equal(
    rewritten.replace('mode = "project"', 'mode = "template"'),
    memory,
  );
});

test("project mode rewrite reports a missing assignment", () => {
  assert.equal(setProjectMode("schema_version = 1\n[checks]\n"), null);
  assert.equal(readMode("schema_version = 1\n"), null);
});

test("generated sources reproduce the committed template formatting", async () => {
  const sitePath = `${root}src/config/site.ts`;
  const businessPath = `${root}src/data/business.json`;
  assert.equal(
    await formatSource(renderSiteConfig(site), sitePath),
    readFileSync(sitePath, "utf8"),
  );
  assert.equal(
    await formatSource(renderBusinessData(business), businessPath),
    readFileSync(businessPath, "utf8"),
  );
});

test("argument parsing accepts flags and rejects misuse", () => {
  assert.deepEqual(parseArguments(["client.json", "--dry-run", "--force"]), {
    inputPath: "client.json",
    dryRun: true,
    force: true,
    newIdentity: false,
    findings: [],
  });
  assert.deepEqual(codes(parseArguments([]).findings), ["INPUT_REQUIRED"]);
  assert.deepEqual(codes(parseArguments(["a.json", "b.json"]).findings), [
    "TOO_MANY_ARGUMENTS",
  ]);
  assert.deepEqual(codes(parseArguments(["a.json", "--yolo"]).findings), [
    "UNKNOWN_FLAG",
  ]);
});

test("input parsing rejects malformed, invalid, and unknown fields", () => {
  assert.deepEqual(codes(parseInput("{", "client.json").findings), [
    "INPUT_MALFORMED",
  ]);
  assert.deepEqual(codes(parseInput("{}", "client.json").findings), [
    "INPUT_INVALID",
    "INPUT_INVALID",
    "INPUT_INVALID",
  ]);
  assert.deepEqual(
    codes(
      parseInput(
        JSON.stringify({ ...clientInput, unexpected: true }),
        "client.json",
      ).findings,
    ),
    ["INPUT_INVALID"],
  );
  assert.deepEqual(
    codes(
      parseInput(
        JSON.stringify({
          ...clientInput,
          site: { canonicalUrl: "http://tallernopal.mx" },
        }),
        "client.json",
      ).findings,
    ),
    ["INPUT_INVALID"],
  );
});

test("the command reports misuse without writing", () => {
  const result = spawnSync(process.execPath, ["scripts/init-client.ts"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /INPUT_REQUIRED/);
});

test("a dry run reports the plan and leaves the repository unchanged", () => {
  const directory = mkdtempSync(join(tmpdir(), "pyme-init-"));
  const inputPath = join(directory, "client.json");
  writeFileSync(inputPath, JSON.stringify(clientInput), "utf8");

  const before = [
    "memory.toml",
    "src/config/site.ts",
    "src/data/business.json",
  ].map((path) => readFileSync(`${root}${path}`, "utf8"));

  const result = spawnSync(
    process.execPath,
    ["scripts/init-client.ts", inputPath, "--dry-run"],
    { cwd: root, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /CLIENT INITIALIZATION: DRY RUN/);
  assert.match(result.stdout, /PRODUCTION_APPROVAL_REQUIRED/);
  assert.deepEqual(
    ["memory.toml", "src/config/site.ts", "src/data/business.json"].map(
      (path) => readFileSync(`${root}${path}`, "utf8"),
    ),
    before,
  );
});

test("a staged write failure leaves every initializer owner unchanged", () => {
  const directory = mkdtempSync(join(tmpdir(), "pyme-init-transaction-"));
  const paths = ["site.ts", "business.json", "memory.toml"].map((name) =>
    join(directory, name),
  );
  const before = ["site", "business", "memory"];
  try {
    paths.forEach((path, index) => writeFileSync(path, before[index], "utf8"));
    assert.throws(
      () =>
        commitFileTransaction(
          paths.map((path, index) => ({
            path,
            contents: `${before[index]}-updated`,
          })),
          {
            exists: existsSync,
            write: (path, contents) => {
              if (path.includes("memory.toml.pyme-init-test.tmp"))
                throw new Error("injected final staging failure");
              writeFileSync(path, contents, "utf8");
            },
            rename: renameSync,
            remove: (path) => rmSync(path, { force: true }),
          },
          "test",
        ),
      /injected final staging failure/,
    );
    assert.deepEqual(
      paths.map((path) => readFileSync(path, "utf8")),
      before,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("a commit rename failure restores every initializer owner", () => {
  const directory = mkdtempSync(join(tmpdir(), "pyme-init-transaction-"));
  const paths = ["site.ts", "business.json", "memory.toml"].map((name) =>
    join(directory, name),
  );
  const before = ["site", "business", "memory"];
  try {
    paths.forEach((path, index) => writeFileSync(path, before[index], "utf8"));
    assert.throws(
      () =>
        commitFileTransaction(
          paths.map((path, index) => ({
            path,
            contents: `${before[index]}-updated`,
          })),
          {
            exists: existsSync,
            write: writeFileSync,
            rename: (from, to) => {
              if (from.includes("memory.toml.pyme-init-test.tmp"))
                throw new Error("injected final commit failure");
              renameSync(from, to);
            },
            remove: (path) => rmSync(path, { force: true }),
          },
          "test",
        ),
      /injected final commit failure/,
    );
    assert.deepEqual(
      paths.map((path) => readFileSync(path, "utf8")),
      before,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the initialization lock admits one ordinary writer at a time", () => {
  const directory = mkdtempSync(join(tmpdir(), "pyme-init-lock-"));
  const path = join(directory, ".pyme-init.lock");
  try {
    const release = acquireInitializationLock(path);
    assert.ok(release);
    assert.equal(acquireInitializationLock(path), null);
    release();
    const secondRelease = acquireInitializationLock(path);
    assert.ok(secondRelease);
    secondRelease();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

// --- site identity stability ----------------------------------------------
//
// A site ID is a durable fact owned by src/config/site.ts. Re-initialization
// must read it back from its owner rather than mint a new one, because the
// identity is published in the public manifest and cannot be recovered once
// replaced.

test("re-initialization preserves the existing site identity", () => {
  const plan = planInitialization(
    context({ existingSiteId: "2250c019-ae4a-4f19-b152-873f14a4ce0a" }),
  );
  assert.equal(plan.site.siteId, "2250c019-ae4a-4f19-b152-873f14a4ce0a");
  assert.equal(plan.identitySource, "preserved");
});

test("an explicit input identity overrides the existing one", () => {
  const plan = planInitialization(
    context({
      input: {
        ...clientInput,
        site: {
          ...clientInput.site,
          siteId: "6f1d9d4c-2f1e-4a55-9a7e-6b0f7a1c22d8",
        },
      },
      existingSiteId: "2250c019-ae4a-4f19-b152-873f14a4ce0a",
    }),
  );
  assert.equal(plan.site.siteId, "6f1d9d4c-2f1e-4a55-9a7e-6b0f7a1c22d8");
  assert.equal(plan.identitySource, "input");
});

test("a new identity is issued only when explicitly requested", () => {
  const plan = planInitialization(
    context({
      existingSiteId: "2250c019-ae4a-4f19-b152-873f14a4ce0a",
      newIdentity: true,
    }),
  );
  assert.equal(plan.site.siteId, "aedc8c8b-948a-447b-9c73-f18521ea0915");
  assert.equal(plan.identitySource, "generated");
});

test("the template sample identity is never preserved", () => {
  const plan = planInitialization(
    context({ existingSiteId: "00000000-0000-4000-8000-000000000000" }),
  );
  assert.equal(plan.site.siteId, "aedc8c8b-948a-447b-9c73-f18521ea0915");
  assert.equal(plan.identitySource, "generated");
});

test("--new-identity is parsed and unknown flags still fail", () => {
  assert.equal(parseArguments(["in.json", "--new-identity"]).newIdentity, true);
  assert.equal(parseArguments(["in.json"]).newIdentity, false);
  assert.deepEqual(codes(parseArguments(["in.json", "--nope"]).findings), [
    "UNKNOWN_FLAG",
  ]);
});

test("outstanding content review is reported, not treated as a blocker", () => {
  const plan = planInitialization(
    context({
      locations: [
        {
          id: "sucursal-centro",
          approvedForPublication: false,
          hours: [],
        } as never,
      ],
      services: [{ id: "carpinteria", approvedForPublication: false } as never],
    }),
  );
  assert.deepEqual(plan.findings, []);
  assert.equal(
    plan.deferred.filter((f) => f.code === "CONTENT_REVIEW_REQUIRED").length,
    2,
  );
});
