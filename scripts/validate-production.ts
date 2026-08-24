import { readFileSync } from "node:fs";
import { business, productionApproval } from "../src/data/index.ts";
import { site } from "../src/config/site.ts";
import { ROOT, isMain, report, type Finding } from "./lib/validation.ts";

const sampleValues = [
  "example.com",
  "negocio de ejemplo",
  "00000000-0000-4000-8000-000000000000",
  "pendiente de verificación",
];

type ProductionState = {
  mode: string;
  facts: unknown;
  canonicalUrl: string;
  privacyText: string;
  approvals: {
    businessFactsVerified: boolean;
    domainOwnershipVerified: boolean;
    privacyNoticeApproved: boolean;
  };
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

  for (const [key, approved] of Object.entries(state.approvals)) {
    if (!approved) {
      findings.push({
        code: "PRODUCTION_APPROVAL_REQUIRED",
        path: "src/data/production.json",
        message: `${key} must be explicitly verified before production`,
      });
    }
  }

  const facts = JSON.stringify(state.facts).toLowerCase();
  for (const value of sampleValues) {
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
    facts: { business, site },
    canonicalUrl: site.canonicalUrl,
    privacyText: readFileSync(
      `${ROOT}src/content/legal/aviso-de-privacidad.md`,
      "utf8",
    ),
    approvals: productionApproval,
  });
};

if (isMain(import.meta.url)) {
  report("PRODUCTION SOURCE VALIDATION", validateProduction());
}
