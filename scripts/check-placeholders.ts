import {
  ROOT,
  displayPath,
  isMain,
  readUtf8,
  report,
  textFiles,
  type Finding,
} from "./lib/validation.ts";

const activeMarker = "@@PYME_" + "UNRESOLVED";
const legacyMarker = "TEMPLATE_PLACEHOLDER" + "[";

export const checkPlaceholders = (
  directories = ["src", "public", "dist"],
): Finding[] => {
  const findings: Finding[] = [];
  for (const directory of directories) {
    for (const path of textFiles(`${ROOT}${directory}`)) {
      const content = readUtf8(path);
      if (content.includes(activeMarker) || content.includes(legacyMarker)) {
        findings.push({
          code: "UNRESOLVED_MARKER",
          path: displayPath(path),
          message: "production-relevant output contains an unresolved marker",
        });
      }
    }
  }
  return findings;
};

if (isMain(import.meta.url)) {
  report("PLACEHOLDER CHECK", checkPlaceholders());
}
