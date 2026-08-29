import { z } from "zod";
import {
  IdentifierSchema,
  NonEmptyTextSchema,
  NullableHttpUrlSchema,
} from "./common.ts";
export const TestimonialSchema = z.strictObject({
  id: IdentifierSchema,
  quote: NonEmptyTextSchema,
  displayName: NonEmptyTextSchema,
  sourceUrl: NullableHttpUrlSchema,
  approvedForPublication: z.literal(true),
});
export const TestimonialsSchema = z
  .array(TestimonialSchema)
  .refine(
    (items) => new Set(items.map(({ id }) => id)).size === items.length,
    "testimonial IDs must be unique",
  );
export type Testimonial = z.infer<typeof TestimonialSchema>;
