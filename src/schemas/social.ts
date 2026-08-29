import { z } from "zod";
import { HttpUrlSchema } from "./common.ts";
export const SocialAccountSchema = z.strictObject({
  platform: z.enum([
    "facebook",
    "instagram",
    "linkedin",
    "tiktok",
    "youtube",
    "x",
  ]),
  url: HttpUrlSchema,
});
export const SocialAccountsSchema = z
  .array(SocialAccountSchema)
  .refine(
    (items) =>
      new Set(items.map(({ platform }) => platform)).size === items.length,
    "social platforms must be unique",
  );
export type SocialAccount = z.infer<typeof SocialAccountSchema>;
