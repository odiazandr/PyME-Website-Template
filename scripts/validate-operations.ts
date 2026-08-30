import { activeForms } from "../src/config/forms.ts";
import type { OperationsReadiness } from "../src/schemas/operations-readiness.ts";
import { loadOperationsReadiness } from "./lib/operations-readiness.ts";
import { isMain, report, type Finding } from "./lib/validation.ts";

type OperationsState = {
  formsEnabled: boolean;
  readiness: OperationsReadiness;
};

const requiredOperations = [
  ["responseOwnerAssigned", "a response owner must be assigned"],
  ["retentionPolicyDocumented", "a retention policy must be documented"],
  ["deletionOwnerAssigned", "a deletion owner must be assigned"],
  [
    "emergencyEscalationReviewed",
    "emergency language and its escalation path must be reviewed",
  ],
  ["privacyContactConfirmed", "a privacy contact must be confirmed"],
  ["publicationApproverAssigned", "a publication approver must be assigned"],
  [
    "domainManagementOwnerAssigned",
    "a domain-management owner must be assigned",
  ],
  ["rollbackOwnerAssigned", "a rollback owner must be assigned"],
] as const satisfies ReadonlyArray<
  readonly [keyof OperationsReadiness, string]
>;

const requiredFormOperations = [
  ["formRecipientApproved", "a form recipient must be approved"],
  ["inboxMonitored", "the recipient inbox must be monitored"],
  [
    "formDeliveryVerified",
    "a real form submission must be verified in the recipient inbox",
  ],
] as const satisfies ReadonlyArray<
  readonly [keyof OperationsReadiness, string]
>;

export const evaluateOperationsReadiness = ({
  formsEnabled,
  readiness,
}: OperationsState): Finding[] => {
  const findings: Finding[] = [];
  for (const [key, message] of requiredOperations) {
    if (!readiness[key])
      findings.push({
        code: "OPERATIONS_READINESS_REQUIRED",
        path: "operations-readiness.json",
        message,
      });
  }
  if (formsEnabled) {
    for (const [key, message] of requiredFormOperations) {
      if (!readiness[key])
        findings.push({
          code: "FORM_OPERATIONS_READINESS_REQUIRED",
          path: "operations-readiness.json",
          message,
        });
    }
  }
  return findings;
};

export const validateOperationsReadiness = (): Finding[] => {
  try {
    return evaluateOperationsReadiness({
      formsEnabled: activeForms.length > 0,
      readiness: loadOperationsReadiness(),
    });
  } catch (error) {
    return [
      {
        code: "OPERATIONS_READINESS_INVALID",
        path: "operations-readiness.json",
        message:
          error instanceof Error
            ? error.message
            : "operations readiness data could not be read",
      },
    ];
  }
};

if (isMain(import.meta.url))
  report("OPERATIONS READINESS VALIDATION", validateOperationsReadiness());
