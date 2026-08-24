import { z } from "zod";
export const TemplateMetadataSchema = z.strictObject({
  schemaVersion: z.literal(1),
  templateVersion: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
      "must be a semantic version without a prefix or leading zeroes",
    ),
});
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
