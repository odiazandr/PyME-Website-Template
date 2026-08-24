import { z } from "zod";
import { IdentifierSchema, NonEmptyTextSchema } from "./common.ts";
export const ServiceSchema = z.strictObject({
  id: IdentifierSchema,
  name: NonEmptyTextSchema,
  shortDescription: NonEmptyTextSchema,
  featured: z.boolean(),
  detailPage: z.boolean(),
});
export const ServicesSchema = z
  .array(ServiceSchema)
  .min(1)
  .refine(
    (items) => new Set(items.map(({ id }) => id)).size === items.length,
    "service IDs must be unique",
  );
export type Service = z.infer<typeof ServiceSchema>;
