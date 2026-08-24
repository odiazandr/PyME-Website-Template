import { z } from "zod";
import { E164PhoneSchema, NonEmptyTextSchema } from "./common.ts";
export const BusinessSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    publicName: NonEmptyTextSchema,
    legalName: NonEmptyTextSchema.nullable(),
    description: NonEmptyTextSchema,
    primaryPhone: z.strictObject({
      display: NonEmptyTextSchema,
      e164: E164PhoneSchema,
    }),
    email: z.email(),
    whatsapp: z.strictObject({
      enabled: z.boolean(),
      number: E164PhoneSchema.nullable(),
    }),
  })
  .superRefine((value, context) => {
    if (value.whatsapp.enabled && value.whatsapp.number === null)
      context.addIssue({
        code: "custom",
        path: ["whatsapp", "number"],
        message: "is required when WhatsApp is enabled",
      });
  });
export type Business = z.infer<typeof BusinessSchema>;
