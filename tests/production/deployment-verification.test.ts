import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateDeployment,
  readNetlifyContract,
  type DeploymentEvidence,
} from "../../scripts/verify-deployment.ts";

const contract = readNetlifyContract(`
[build]
command = "npm run quality"
publish = "dist"

[[headers]]
for = "/*"

[headers.values]
X-Frame-Options = "DENY"
`);

const readyEvidence = (): DeploymentEvidence => ({
  site: {
    custom_domain: "example.com",
    ssl_url: "https://example.com",
    build_settings: { cmd: "npm run quality", dir: "dist" },
    processing_settings: { ignore_html_forms: false },
    published_deploy: { commit_ref: "abc123" },
  },
  forms: [{ id: "form-1", name: "contacto", submission_count: 1 }],
  hooks: [
    {
      type: "email",
      event: "submission_created",
      form_id: "form-1",
    },
  ],
  live: { status: 200, headers: new Headers({ "x-frame-options": "DENY" }) },
  expectedCommit: "abc123",
  expectedBuild: contract.build,
  expectedHeaders: contract.headers,
});

test("deployment verifier reads the committed build and public-header contract", () => {
  assert.deepEqual(contract, {
    build: { command: "npm run quality", publish: "dist" },
    headers: { "x-frame-options": "DENY" },
  });
});

test("deployment verifier accepts matching provider evidence", () => {
  assert.ok(
    evaluateDeployment(readyEvidence()).every(
      ({ status }) => status === "passed",
    ),
  );
});

test("form evidence distinguishes registration, stored submission, and notification", () => {
  const evidence = readyEvidence();
  evidence.forms[0].submission_count = 0;
  evidence.hooks = [];

  const checks = evaluateDeployment(evidence);
  assert.equal(
    checks.find(({ name }) => name === "form contacto: registration")?.status,
    "passed",
  );
  assert.equal(
    checks.find(({ name }) => name === "form contacto: stored submission")
      ?.status,
    "unverified",
  );
  assert.equal(
    checks.find(({ name }) => name === "form contacto: notification")?.status,
    "failed",
  );
});

test("disabled form detection and a stale production revision fail verification", () => {
  const evidence = readyEvidence();
  evidence.site.processing_settings = { ignore_html_forms: true };
  evidence.site.published_deploy = { commit_ref: "outdated" };

  const failed = evaluateDeployment(evidence).filter(
    ({ status }) => status === "failed",
  );
  assert.deepEqual(failed.map(({ name }) => name).sort(), [
    "form detection",
    "production deploy source",
  ]);
});
