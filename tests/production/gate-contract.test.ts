import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

// package.json owns production gate order. This test protects that owner from
// becoming a no-op or silently losing a required stage.
test("the strict production gate contains every required stage in order", () => {
  const manifest = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
  assert.deepEqual(manifest.scripts["quality:production"].split(" && "), [
    "python ops/memory_health.py --scope contracts",
    "npm run quality:static",
    "npm run validate:project",
    "npm run validate:production",
    "npm run check:placeholders",
    "npm run check:assets",
    "npm run build",
    "npm run test:artifacts:built",
    "npm run verify:dist",
    "npm run check:links",
    "npm run check:public-output",
  ]);
});
