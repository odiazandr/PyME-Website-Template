import { z } from "zod";
export const SocialAccountSchema = z.strictObject({
  platform: z.enum([
    "facebook",
    "instagram",
    "linkedin",
    "tiktok",
    "youtube",
    "x",
  ]),
  url: z.url(),
});
export const SocialAccountsSchema = z
  .array(SocialAccountSchema)
  .refine(
    (items) =>
      new Set(items.map(({ platform }) => platform)).size === items.length,
    "social platforms must be unique",
  );
export type SocialAccount = z.infer<typeof SocialAccountSchema>;
