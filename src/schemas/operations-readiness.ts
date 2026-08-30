import { z } from "zod";

// These are deliberately attestations, rather than operational details. Names,
// email addresses, escalation procedures, and retention records must stay in
// the client's private operational systems.
export const OperationsReadinessSchema = z.strictObject({
  schemaVersion: z.literal(1),
  formRecipientApproved: z.boolean(),
  inboxMonitored: z.boolean(),
  formDeliveryVerified: z.boolean(),
  responseOwnerAssigned: z.boolean(),
  retentionPolicyDocumented: z.boolean(),
  deletionOwnerAssigned: z.boolean(),
  emergencyEscalationReviewed: z.boolean(),
  privacyContactConfirmed: z.boolean(),
  publicationApproverAssigned: z.boolean(),
  domainManagementOwnerAssigned: z.boolean(),
  rollbackOwnerAssigned: z.boolean(),
});

export type OperationsReadiness = z.infer<typeof OperationsReadinessSchema>;
