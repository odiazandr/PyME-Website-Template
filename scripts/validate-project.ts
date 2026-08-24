import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { navigation } from "../src/config/navigation.ts";
import { ROOT, isMain, report, type Finding } from "./lib/validation.ts";

export const validateProject = (): Finding[] => {
  const findings: Finding[] = [];
  for (const item of navigation) {
    const page =
      item.href === "/"
        ? "src/pages/index.astro"
        : `src/pages${item.href.slice(0, -1)}.astro`;
    if (!existsSync(resolve(ROOT, page))) {
      findings.push({
        code: "NAVIGATION_TARGET_MISSING",
        path: "src/config/navigation.ts",
        message: `${item.href} does not resolve to ${page}`,
      });
    }
  }
  return findings;
};

if (isMain(import.meta.url)) {
  report("PROJECT VALIDATION", validateProject());
}
