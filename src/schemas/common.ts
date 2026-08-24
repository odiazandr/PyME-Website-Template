import { z } from "zod";
export const IdentifierSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    "must be a lowercase kebab-case identifier",
  );
export const NonEmptyTextSchema = z.string().trim().min(1);
export const E164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "must use E.164 format");
export const NullableUrlSchema = z.url().nullable();
