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

// Browser-visible URLs are not merely strings that parse as URLs. Credentials
// violate the public-data boundary, while executable and data schemes are not
// valid navigation or remote-asset values for this static foundation.
export const HttpUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return (
    (url.protocol === "https:" || url.protocol === "http:") &&
    url.username === "" &&
    url.password === ""
  );
}, "public URL must use HTTP(S) without credentials");

export const NullableHttpUrlSchema = HttpUrlSchema.nullable();
