import { readFileSync } from "node:fs";
import {
  business,
  locations,
  productionApproval,
  services,
  socialAccounts,
  team,
  testimonials,
} from "../src/data/index.ts";
import { site } from "../src/config/site.ts";
import { ROOT, isMain, report, type Finding } from "./lib/validation.ts";

// Literal strings the distribution template ships as reference content. They are
// deliberately unambiguous: a real business may legitimately call itself
// "Ubicación principal", so only wording that cannot be a verified fact belongs
// here. tests/production/validation.test.ts asserts every entry still occurs in
// the shipped fixtures, so removing a fixture cannot silently retire a rule.
export const SAMPLE_VALUES = [
  "example.com",
  "negocio de ejemplo",
  "00000000-0000-4000-8000-000000000000",
  "pendiente de verificación",
  "dirección pendiente",
  "contenido de referencia pendiente de sustituir",
];

type PublishableRecord = { id: string; approvedForPublication: boolean };
type ReviewableLocation = PublishableRecord & {
  hours: { closed: boolean }[];
};

type ProductionState = {
  mode: string;
  facts: unknown;
  canonicalUrl: string;
  privacyText: string;
  approvals: {
    deploymentContext: "template" | "rehearsal" | "production";
    businessFactsVerified: boolean;
    domainOwnershipVerified: boolean;
    privacyNoticeApproved: boolean;
  };
  locations: ReviewableLocation[];
  services: PublishableRecord[];
};

export const evaluateProduction = (state: ProductionState): Finding[] => {
  const findings: Finding[] = [];
  if (state.mode !== "project") {
    findings.push({
      code: "PROJECT_MODE_REQUIRED",
      path: "memory.toml",
      message: "production requires memory mode project",
    });
  }

  if (state.approvals.deploymentContext !== "production") {
    findings.push({
      code: "DEPLOYMENT_CONTEXT_NOT_PRODUCTION",
      path: "src/data/production.json",
      message: `deployment context is ${state.approvals.deploymentContext}; production requires production`,
    });
  }

  for (const [key, approved] of Object.entries(state.approvals)) {
    if (!approved) {
      findings.push({
        code: "PRODUCTION_APPROVAL_REQUIRED",
        path: "src/data/production.json",
        message: `${key} must be explicitly verified before production`,
      });
    }
  }

  // Every published record carries its own review attestation. An agent may not
  // set these; they record that a person checked the fact against reality.
  for (const [domain, records] of [
    ["src/data/locations.json", state.locations],
    ["src/data/services.json", state.services],
  ] as const) {
    for (const record of records) {
      if (!record.approvedForPublication) {
        findings.push({
          code: "CONTENT_REVIEW_REQUIRED",
          path: domain,
          message: `${record.id} must set approvedForPublication before production`,
        });
      }
    }
  }

  // A published location that is closed every day of the week is reference data
  // that was never replaced, not a verified business fact.
  for (const location of state.locations) {
    if (
      location.approvedForPublication &&
      location.hours.every(({ closed }) => closed)
    ) {
      findings.push({
        code: "LOCATION_NEVER_OPEN",
        path: "src/data/locations.json",
        message: `${location.id} is approved but closed every day of the week`,
      });
    }
  }

  const facts = JSON.stringify(state.facts).toLowerCase();
  for (const value of SAMPLE_VALUES) {
    if (facts.includes(value)) {
      findings.push({
        code: "SAMPLE_VALUE",
        path: "src/data|src/config",
        message: `replace sample value: ${value}`,
      });
    }
  }

  const hostname = new URL(state.canonicalUrl).hostname.toLowerCase();
  if (hostname === "netlify.app" || hostname.endsWith(".netlify.app")) {
    findings.push({
      code: "PROVIDER_CANONICAL",
      path: "src/config/site.ts",
      message: "production canonical URL must use the client-owned domain",
    });
  }

  const privacy = state.privacyText.toLowerCase();
  if (
    privacy.includes("revisión legal pendiente") ||
    privacy.includes("no constituye asesoría legal")
  ) {
    findings.push({
      code: "PRIVACY_UNAPPROVED",
      path: "src/content/legal/aviso-de-privacidad.md",
      message: "replace the reference instruction with approved client text",
    });
  }
  return findings;
};

export const validateProduction = (): Finding[] => {
  const memory = readFileSync(`${ROOT}memory.toml`, "utf8");
  const mode = /^mode\s*=\s*"([^"]+)"\s*$/m.exec(memory)?.[1] ?? "missing";
  return evaluateProduction({
    mode,
    // Every canonical data domain is scanned. A domain missing here is a domain
    // whose unreplaced reference content can reach a client's public website.
    facts: {
      business,
      site,
      locations,
      services,
      team,
      testimonials,
      socialAccounts,
    },
    canonicalUrl: site.canonicalUrl,
    privacyText: readFileSync(
      `${ROOT}src/content/legal/aviso-de-privacidad.md`,
      "utf8",
    ),
    approvals: productionApproval,
    locations,
    services,
  });
};

if (isMain(import.meta.url)) {
  report("PRODUCTION SOURCE VALIDATION", validateProduction());
}
