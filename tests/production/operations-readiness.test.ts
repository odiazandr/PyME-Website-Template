import assert from "node:assert/strict";
import { test } from "node:test";
import { OperationsReadinessSchema } from "../../src/schemas/operations-readiness.ts";
import { evaluateOperationsReadiness } from "../../scripts/validate-operations.ts";

const ready = OperationsReadinessSchema.parse({
  schemaVersion: 1,
  formRecipientApproved: true,
  inboxMonitored: true,
  formDeliveryVerified: true,
  responseOwnerAssigned: true,
  retentionPolicyDocumented: true,
  deletionOwnerAssigned: true,
  emergencyEscalationReviewed: true,
  privacyContactConfirmed: true,
  publicationApproverAssigned: true,
  domainManagementOwnerAssigned: true,
  rollbackOwnerAssigned: true,
});

test("operations readiness requires every universal human attestation", () => {
  const findings = evaluateOperationsReadiness({
    formsEnabled: false,
    readiness: { ...ready, rollbackOwnerAssigned: false },
  });
  assert.deepEqual(
    findings.map((finding) => finding.code),
    ["OPERATIONS_READINESS_REQUIRED"],
  );
});

test("form operations are required only when a form is enabled", () => {
  const incompleteFormReadiness = { ...ready, inboxMonitored: false };
  assert.deepEqual(
    evaluateOperationsReadiness({
      formsEnabled: false,
      readiness: incompleteFormReadiness,
    }),
    [],
  );
  assert.deepEqual(
    evaluateOperationsReadiness({
      formsEnabled: true,
      readiness: incompleteFormReadiness,
    }).map((finding) => finding.code),
    ["FORM_OPERATIONS_READINESS_REQUIRED"],
  );
});

test("operations readiness schema rejects private-detail-shaped unknown fields", () => {
  assert.equal(
    OperationsReadinessSchema.safeParse({
      ...ready,
      recipientEmail: "private@example.com",
    }).success,
    false,
  );
});
