import { resolve } from "node:path";
import {
  ROOT,
  displayPath,
  isMain,
  readUtf8,
  report,
  textFiles,
  type Finding,
} from "./lib/validation.ts";

const suspicious = [
  { code: "LOCALHOST_LEAK", pattern: /localhost(?::\d+)?/i },
  { code: "EXAMPLE_DOMAIN_LEAK", pattern: /example\.(?:com|org|net)/i },
  { code: "SAMPLE_IDENTITY_LEAK", pattern: /negocio de ejemplo/i },
  {
    code: "ZERO_SITE_ID_LEAK",
    pattern: /00000000-0000-4000-8000-000000000000/i,
  },
  {
    code: "UNRESOLVED_MARKER_LEAK",
    pattern: new RegExp("@@PYME_" + "UNRESOLVED"),
  },
  { code: "PLACEHOLDER_ADDRESS_LEAK", pattern: /direcci[oó]n pendiente/i },
  {
    code: "PLACEHOLDER_CONTENT_LEAK",
    pattern: /contenido de referencia pendiente de sustituir/i,
  },
];

export const checkPublicOutput = (): Finding[] => {
  const findings: Finding[] = [];
  for (const path of textFiles(resolve(ROOT, "dist"))) {
    const content = readUtf8(path);
    for (const rule of suspicious) {
      if (rule.pattern.test(content)) {
        findings.push({
          code: rule.code,
          path: displayPath(path),
          message: "public build contains a forbidden production sentinel",
        });
      }
    }
  }
  return findings;
};

export const scanPublicText = (content: string): string[] =>
  suspicious
    .filter((rule) => rule.pattern.test(content))
    .map((rule) => rule.code);

if (isMain(import.meta.url)) {
  report("PUBLIC OUTPUT CHECK", checkPublicOutput());
}
