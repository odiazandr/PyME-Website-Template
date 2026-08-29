import { z } from "zod";
import { CanonicalUrlSchema } from "./site.ts";

export const PublicManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  siteId: z.uuid(),
  templateVersion: z
    .string()
    .regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/),
  canonicalUrl: CanonicalUrlSchema,
});

export type PublicManifest = z.infer<typeof PublicManifestSchema>;
