import { statSync } from "node:fs";
import { resolve } from "node:path";
import {
  ROOT,
  displayPath,
  isMain,
  report,
  walkFiles,
  type Finding,
} from "./lib/validation.ts";

const maxPublicAssetBytes = 5 * 1024 * 1024;

export const checkAssets = (): Finding[] => {
  const findings: Finding[] = [];
  for (const path of walkFiles(resolve(ROOT, "public"))) {
    if (statSync(path).size > maxPublicAssetBytes) {
      findings.push({
        code: "PUBLIC_ASSET_OVERSIZED",
        path: displayPath(path),
        message: "public passthrough asset exceeds the 5 MiB review threshold",
      });
    }
  }
  return findings;
};

if (isMain(import.meta.url)) {
  report("ASSET CHECK", checkAssets());
}
