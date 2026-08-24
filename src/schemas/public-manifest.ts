import { z } from "zod";

export const PublicManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  siteId: z.uuid(),
  templateVersion: z
    .string()
    .regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/),
  canonicalUrl: z.url().refine((value) => value.startsWith("https://")),
});

export type PublicManifest = z.infer<typeof PublicManifestSchema>;
