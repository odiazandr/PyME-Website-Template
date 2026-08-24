import { z } from "zod";

export const ProductionApprovalSchema = z.strictObject({
  schemaVersion: z.literal(1),
  businessFactsVerified: z.boolean(),
  domainOwnershipVerified: z.boolean(),
  privacyNoticeApproved: z.boolean(),
});

export type ProductionApproval = z.infer<typeof ProductionApprovalSchema>;
