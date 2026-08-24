import { z } from "zod";
import {
  IdentifierSchema,
  NonEmptyTextSchema,
  NullableUrlSchema,
} from "./common.ts";
export const TeamMemberSchema = z.strictObject({
  id: IdentifierSchema,
  displayName: NonEmptyTextSchema,
  publicRole: NonEmptyTextSchema,
  biography: NonEmptyTextSchema.nullable(),
  image: NullableUrlSchema,
  approvedForPublication: z.literal(true),
});
export const TeamSchema = z
  .array(TeamMemberSchema)
  .refine(
    (items) => new Set(items.map(({ id }) => id)).size === items.length,
    "team member IDs must be unique",
  );
export type TeamMember = z.infer<typeof TeamMemberSchema>;
