import { z } from "zod";
import {
  IdentifierSchema,
  NonEmptyTextSchema,
  NullableHttpUrlSchema,
} from "./common.ts";
export const TeamMemberSchema = z.strictObject({
  id: IdentifierSchema,
  displayName: NonEmptyTextSchema,
  publicRole: NonEmptyTextSchema,
  biography: NonEmptyTextSchema.nullable(),
  image: NullableHttpUrlSchema,
  approvedForPublication: z.literal(true),
});
export const TeamSchema = z
  .array(TeamMemberSchema)
  .refine(
    (items) => new Set(items.map(({ id }) => id)).size === items.length,
    "team member IDs must be unique",
  );
export type TeamMember = z.infer<typeof TeamMemberSchema>;
