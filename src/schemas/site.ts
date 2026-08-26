import { z } from "zod";
export const CanonicalUrlSchema = z
  .url()
  .refine(
    (value) => value.startsWith("https://"),
    "canonical URL must use HTTPS",
  )
  // The canonical URL is a bare origin. Credentials would reach the public
  // manifest and every canonical link; a path, query, or fragment would make
  // every generated absolute URL wrong.
  .refine((value) => {
    const url = new URL(value);
    return (
      url.username === "" &&
      url.password === "" &&
      (url.pathname === "" || url.pathname === "/") &&
      url.search === "" &&
      url.hash === ""
    );
  }, "canonical URL must be a bare origin without credentials, path, query, or fragment");

export const SiteSchema = z.strictObject({
  schemaVersion: z.literal(1),
  siteId: z.uuid(),
  canonicalUrl: CanonicalUrlSchema,
  defaultLocale: z.literal("es-MX"),
  titleTemplate: z
    .string()
    .trim()
    .refine((value) => value.includes("%s"), "title template must contain %s"),
});
export type Site = z.infer<typeof SiteSchema>;
