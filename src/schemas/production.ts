import { z } from "zod";

export const DeploymentContextSchema = z.enum([
  "template",
  "rehearsal",
  "production",
]);

export const ProductionApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  deploymentContext: DeploymentContextSchema,
  businessFactsVerified: z.boolean(),
  domainOwnershipVerified: z.boolean(),
  privacyNoticeApproved: z.boolean(),
});

export type ProductionApproval = z.infer<typeof ProductionApprovalSchema>;
