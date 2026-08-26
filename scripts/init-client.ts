import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { format, resolveConfig } from "prettier";
import {
  ClientInitSchema,
  type ClientInit,
} from "../src/schemas/client-init.ts";
import { ProductionApprovalSchema } from "../src/schemas/production.ts";
import { locations, services } from "../src/data/index.ts";
import { SiteSchema, type Site } from "../src/schemas/site.ts";
import { TemplateMetadataSchema } from "../src/schemas/template.ts";
import type { Business } from "../src/schemas/business.ts";
import type { Location } from "../src/schemas/location.ts";
import type { Service } from "../src/schemas/service.ts";
import { evaluateProduction } from "./validate-production.ts";
import { ROOT, isMain, report, type Finding } from "./lib/validation.ts";

// Horizontal whitespace only: `\s` would consume the following newline and
// silently delete the blank line that separates the assignment from `[checks]`.
const MODE_PATTERN = /^mode[^\S\r\n]*=[^\S\r\n]*"([^"]*)"[^\S\r\n]*$/m;

const USAGE =
  "usage: node scripts/init-client.ts <input.json> [--dry-run] [--force] [--new-identity]";

const REWRITTEN_PATHS = [
  "src/config/site.ts",
  "src/data/business.json",
  "memory.toml",
];

// Production findings the initializer deliberately leaves outstanding. They
// record human or operational verification that an agent may not self-authorize.
export const DEFERRED_PRODUCTION_CODES = new Set([
  "PRODUCTION_APPROVAL_REQUIRED",
  "PRIVACY_UNAPPROVED",
  "CONTENT_REVIEW_REQUIRED",
  "LOCATION_NEVER_OPEN",
]);

// The identity the template ships. It is a placeholder, never a client identity,
// so it is not eligible for preservation across a re-initialization.
const SAMPLE_SITE_ID = "00000000-0000-4000-8000-000000000000";

export type InitContext = {
  input: ClientInit;
  mode: string | null;
  generatedSiteId: string;
  privacyText: string;
  approvals: {
    businessFactsVerified: boolean;
    domainOwnershipVerified: boolean;
    privacyNoticeApproved: boolean;
  };
  recordedTemplateVersion: string;
  packageVersion: string;
  force: boolean;
  existingSiteId: string | null;
  newIdentity: boolean;
  locations: Location[];
  services: Service[];
};

export type InitPlan = {
  findings: Finding[];
  deferred: Finding[];
  site: Site;
  business: Business;
  identitySource: IdentitySource;
};

export type IdentitySource = "input" | "preserved" | "generated";

// A site ID is a durable fact owned by src/config/site.ts. Re-initialization
// therefore reads it back from its owner rather than asking the operator to
// repeat it, which would create a second copy of the same durable fact. A new
// identity is only ever issued deliberately.
export const selectSiteId = (
  context: Pick<
    InitContext,
    "input" | "existingSiteId" | "newIdentity" | "generatedSiteId"
  >,
): { siteId: string; source: IdentitySource } => {
  if (context.input.site.siteId)
    return { siteId: context.input.site.siteId, source: "input" };
  if (
    !context.newIdentity &&
    context.existingSiteId &&
    context.existingSiteId !== SAMPLE_SITE_ID
  )
    return { siteId: context.existingSiteId, source: "preserved" };
  return { siteId: context.generatedSiteId, source: "generated" };
};

export const readExistingSiteId = (siteConfig: string): string | null =>
  /siteId:\s*"([0-9a-fA-F-]{36})"/.exec(siteConfig)?.[1] ?? null;

// Derives the client state without touching the filesystem. Initialization is
// refused unless the result would satisfy production source validation for
// every reason inside this command's control.
export const planInitialization = (context: InitContext): InitPlan => {
  const findings: Finding[] = [];

  if (context.mode === null) {
    findings.push({
      code: "MEMORY_MODE_UNREADABLE",
      path: "memory.toml",
      message: "no top-level mode assignment was found",
    });
  } else if (context.mode === "project" && !context.force) {
    findings.push({
      code: "ALREADY_INITIALIZED",
      path: "memory.toml",
      message:
        "repository is already in project mode; pass --force to overwrite client identity",
    });
  }

  if (context.recordedTemplateVersion !== context.packageVersion) {
    findings.push({
      code: "TEMPLATE_VERSION_MISMATCH",
      path: "src/data/template.json",
      message: `recorded template version ${context.recordedTemplateVersion} does not match package version ${context.packageVersion}`,
    });
  }

  const business = context.input.business;
  const identity = selectSiteId(context);
  const site = SiteSchema.parse({
    schemaVersion: 1,
    siteId: identity.siteId,
    canonicalUrl: context.input.site.canonicalUrl,
    defaultLocale: "es-MX",
    titleTemplate:
      context.input.site.titleTemplate ?? `%s | ${business.publicName}`,
  });

  const projected = evaluateProduction({
    mode: "project",
    facts: { business, site },
    canonicalUrl: site.canonicalUrl,
    privacyText: context.privacyText,
    approvals: context.approvals,
    locations: context.locations,
    services: context.services,
  });

  for (const finding of projected) {
    if (!DEFERRED_PRODUCTION_CODES.has(finding.code)) findings.push(finding);
  }

  return {
    findings,
    deferred: projected.filter((finding) =>
      DEFERRED_PRODUCTION_CODES.has(finding.code),
    ),
    site,
    business,
    identitySource: identity.source,
  };
};

export const readMode = (memory: string): string | null =>
  MODE_PATTERN.exec(memory)?.[1] ?? null;

export const setProjectMode = (memory: string): string | null =>
  MODE_PATTERN.test(memory)
    ? memory.replace(MODE_PATTERN, 'mode = "project"')
    : null;

export const renderSiteConfig = (site: Site): string =>
  [
    'import { SiteSchema } from "../schemas/site.ts";',
    "export const site = SiteSchema.parse({",
    `  schemaVersion: ${site.schemaVersion},`,
    `  siteId: ${JSON.stringify(site.siteId)},`,
    `  canonicalUrl: ${JSON.stringify(site.canonicalUrl)},`,
    `  defaultLocale: ${JSON.stringify(site.defaultLocale)},`,
    `  titleTemplate: ${JSON.stringify(site.titleTemplate)},`,
    "});",
    "",
  ].join("\n");

// Serialized without indentation on purpose. Prettier preserves an object that
// the author already expanded, so pre-indenting would defeat its own collapsing
// rules and produce data files that do not match the repository's format.
export const renderBusinessData = (business: Business): string =>
  `${JSON.stringify(business)}\n`;

export type Arguments = {
  inputPath: string | null;
  dryRun: boolean;
  force: boolean;
  newIdentity: boolean;
  findings: Finding[];
};

export const parseArguments = (argv: string[]): Arguments => {
  const findings: Finding[] = [];
  const positional: string[] = [];
  let dryRun = false;
  let force = false;
  let newIdentity = false;

  for (const argument of argv) {
    if (argument === "--dry-run") dryRun = true;
    else if (argument === "--force") force = true;
    else if (argument === "--new-identity") newIdentity = true;
    else if (argument.startsWith("--"))
      findings.push({
        code: "UNKNOWN_FLAG",
        path: "scripts/init-client.ts",
        message: `${argument}; ${USAGE}`,
      });
    else positional.push(argument);
  }

  if (positional.length === 0)
    findings.push({
      code: "INPUT_REQUIRED",
      path: "scripts/init-client.ts",
      message: USAGE,
    });
  if (positional.length > 1)
    findings.push({
      code: "TOO_MANY_ARGUMENTS",
      path: "scripts/init-client.ts",
      message: USAGE,
    });

  return {
    inputPath: positional[0] ?? null,
    dryRun,
    force,
    newIdentity,
    findings,
  };
};

export const parseInput = (
  raw: string,
  path: string,
): { input: ClientInit | null; findings: Finding[] } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      input: null,
      findings: [
        {
          code: "INPUT_MALFORMED",
          path,
          message: error instanceof Error ? error.message : "invalid JSON",
        },
      ],
    };
  }

  const result = ClientInitSchema.safeParse(parsed);
  if (!result.success)
    return {
      input: null,
      findings: result.error.issues.map((issue) => ({
        code: "INPUT_INVALID",
        path,
        message: `${issue.path.join(".") || "<root>"}: ${issue.message}`,
      })),
    };

  return { input: result.data, findings: [] };
};

const readInput = (
  path: string,
): { input: ClientInit | null; findings: Finding[] } => {
  try {
    return parseInput(readFileSync(path, "utf8"), path);
  } catch {
    return {
      input: null,
      findings: [
        { code: "INPUT_UNREADABLE", path, message: "file could not be read" },
      ],
    };
  }
};

export const formatSource = async (
  contents: string,
  path: string,
): Promise<string> =>
  format(contents, { ...(await resolveConfig(path)), filepath: path });

const initializeClient = async (argv: string[]): Promise<void> => {
  const parsedArguments = parseArguments(argv);
  if (parsedArguments.findings.length > 0 || parsedArguments.inputPath === null)
    return report("CLIENT INITIALIZATION", parsedArguments.findings);

  const { input, findings: inputFindings } = readInput(
    parsedArguments.inputPath,
  );
  if (input === null) return report("CLIENT INITIALIZATION", inputFindings);

  const memoryPath = `${ROOT}memory.toml`;
  const memory = readFileSync(memoryPath, "utf8");
  const sitePath = `${ROOT}src/config/site.ts`;

  const plan = planInitialization({
    input,
    mode: readMode(memory),
    generatedSiteId: randomUUID(),
    privacyText: readFileSync(
      `${ROOT}src/content/legal/aviso-de-privacidad.md`,
      "utf8",
    ),
    approvals: ProductionApprovalSchema.parse(
      JSON.parse(readFileSync(`${ROOT}src/data/production.json`, "utf8")),
    ),
    recordedTemplateVersion: TemplateMetadataSchema.parse(
      JSON.parse(readFileSync(`${ROOT}src/data/template.json`, "utf8")),
    ).templateVersion,
    packageVersion: JSON.parse(readFileSync(`${ROOT}package.json`, "utf8"))
      .version,
    force: parsedArguments.force,
    existingSiteId: readExistingSiteId(readFileSync(sitePath, "utf8")),
    newIdentity: parsedArguments.newIdentity,
    locations,
    services,
  });

  if (plan.findings.length > 0)
    return report("CLIENT INITIALIZATION", plan.findings);

  const businessPath = `${ROOT}src/data/business.json`;
  const updates = [
    {
      path: sitePath,
      contents: await formatSource(renderSiteConfig(plan.site), sitePath),
    },
    {
      path: businessPath,
      contents: await formatSource(
        renderBusinessData(plan.business),
        businessPath,
      ),
    },
    { path: memoryPath, contents: setProjectMode(memory) as string },
  ];

  if (parsedArguments.dryRun) {
    console.log("CLIENT INITIALIZATION: DRY RUN");
    for (const path of REWRITTEN_PATHS) console.log(`- would rewrite ${path}`);
  } else {
    for (const update of updates)
      writeFileSync(update.path, update.contents, "utf8");
    console.log("CLIENT INITIALIZATION: PASSED");
    for (const path of REWRITTEN_PATHS) console.log(`- rewrote ${path}`);
  }

  const identityNote = {
    input: "supplied by the input document",
    preserved: "preserved from the existing configuration",
    generated: "newly generated",
  }[plan.identitySource];
  console.log(`- site ID ${plan.site.siteId} (${identityNote})`);
  console.log("Remaining human verification before production:");
  for (const finding of plan.deferred)
    console.log(`- [${finding.code}] ${finding.path}: ${finding.message}`);
};

if (isMain(import.meta.url)) await initializeClient(process.argv.slice(2));
