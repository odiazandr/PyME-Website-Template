import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { navigation } from "../src/config/navigation.ts";
import { templateMetadata } from "../src/data/index.ts";
import { ROOT, isMain, report, type Finding } from "./lib/validation.ts";

export const validateProject = (): Finding[] => {
  const findings: Finding[] = [];

  // Guard the collection before iterating it. A loop-only contract accepts an
  // empty collection silently, and a site with no navigation would pass.
  // Widened from the `as const` tuple so the check reflects the runtime value a
  // client repository can actually produce, not this file's current literal.
  const routes: readonly { href: string; label: string }[] = navigation;
  if (routes.length === 0) {
    findings.push({
      code: "NAVIGATION_EMPTY",
      path: "src/config/navigation.ts",
      message: "primary navigation must contain at least one route",
    });
  }

  for (const item of routes) {
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

  // The recorded template version is checked on every run, not only at adoption,
  // so drift introduced by a later upgrade cannot survive unnoticed.
  const packageVersion: string = JSON.parse(
    readFileSync(`${ROOT}package.json`, "utf8"),
  ).version;
  if (templateMetadata.templateVersion !== packageVersion) {
    findings.push({
      code: "TEMPLATE_VERSION_MISMATCH",
      path: "src/data/template.json",
      message: `recorded template version ${templateMetadata.templateVersion} does not match package version ${packageVersion}`,
    });
  }

  return findings;
};

if (isMain(import.meta.url)) {
  report("PROJECT VALIDATION", validateProject());
}
