import { z } from "zod";
export const SiteSchema = z.strictObject({
  schemaVersion: z.literal(1),
  siteId: z.uuid(),
  canonicalUrl: z
    .url()
    .refine(
      (value) => value.startsWith("https://"),
      "canonical URL must use HTTPS",
    ),
  defaultLocale: z.literal("es-MX"),
  titleTemplate: z
    .string()
    .trim()
    .refine((value) => value.includes("%s"), "title template must contain %s"),
});
export type Site = z.infer<typeof SiteSchema>;
