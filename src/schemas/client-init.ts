import { z } from "zod";
import { BusinessSchema } from "./business.ts";
import { CanonicalUrlSchema } from "./site.ts";

export const ClientInitSchema = z.strictObject({
  schemaVersion: z.literal(1),
  site: z.strictObject({
    siteId: z.uuid().optional(),
    canonicalUrl: CanonicalUrlSchema,
    titleTemplate: z
      .string()
      .trim()
      .refine((value) => value.includes("%s"), "title template must contain %s")
      .optional(),
  }),
  business: BusinessSchema,
});

export type ClientInit = z.infer<typeof ClientInitSchema>;
