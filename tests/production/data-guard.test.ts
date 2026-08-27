import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

// Adversarial validation on 2026-08-27 found that the commands the validation
// specification exposes "for diagnosis" crashed with a raw Node stack trace
// naming src/data/index.ts whenever canonical data violated its schema, because
// that barrel parses at module scope and only validate-data wrapped the import.
// The guard restores the promise that invalid types produce structured findings
// rather than tracebacks.

const runGuarded = (source: string) =>
  spawnSync(
    process.execPath,
    [
      "--import",
      "./scripts/lib/data-guard.ts",
      "--input-type=module",
      "-e",
      source,
    ],
    { cwd: root, encoding: "utf8" },
  );

test("a schema violation reports a structured finding, not a traceback", () => {
  const result = runGuarded(
    "import { z } from 'zod'; z.object({ featured: z.boolean() }).parse({ featured: 'yes' });",
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /DATA CONTRACT: FAILED/);
  // The field path and the expected type are what the operator needs.
  assert.match(result.stderr, /- featured: .*expected boolean/);
  assert.doesNotMatch(
    result.stderr,
    /at ModuleJob|at async/,
    "a diagnostic command must not print a stack trace for invalid data",
  );
});

test("errors that are not schema violations keep their detail", () => {
  const result = runGuarded("throw new Error('boom');");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /boom/);
  assert.doesNotMatch(result.stderr, /DATA CONTRACT/);
});

test("every command that imports canonical data installs the guard", () => {
  const manifest = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
  const scripts: Record<string, string> = manifest.scripts;

  // Entry modules with a static import of the canonical data barrel. Any script
  // added to this set must route through the guard or it regains the defect.
  const guarded = [
    "init:client",
    "validate:project",
    "validate:production",
    "verify:dist",
  ];

  for (const name of guarded) {
    assert.ok(scripts[name], `missing script ${name}`);
    assert.match(
      scripts[name],
      /--import \.\/scripts\/lib\/data-guard\.ts/,
      `${name} must install the data guard`,
    );
  }
});
