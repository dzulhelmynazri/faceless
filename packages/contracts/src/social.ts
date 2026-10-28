import { z } from "zod";

export const socialPlatformSchema = z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM"]);

export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

export const supportedSocialPlatformSchema = z.enum([
  "tiktok",
  "youtube",
  "instagram",
]);

export type SupportedSocialPlatform = z.infer<
  typeof supportedSocialPlatformSchema
>;

export const SDK_TO_PLATFORM_MAP = {
  instagram: "INSTAGRAM",
  tiktok: "TIKTOK",
  youtube: "YOUTUBE",
} as const satisfies Record<SupportedSocialPlatform, SocialPlatform>;

export const PLATFORM_TO_SDK_MAP = {
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  YOUTUBE: "youtube",
} as const satisfies Record<SocialPlatform, SupportedSocialPlatform>;

export const socialPlatformParamSchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .pipe(socialPlatformSchema);

export const oauthInitiateQuerySchema = z.object({
  redirect_uri: z.string().min(1),
  state: z.string().min(1),
});

export type OAuthInitiateQuery = z.infer<typeof oauthInitiateQuerySchema>;

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  platform: socialPlatformParamSchema,
  redirect_uri: z.string().min(1),
  state: z.string().min(1).optional(),
});

export type OAuthCallbackQuery = z.infer<typeof oauthCallbackQuerySchema>;

export const connectionStatusSchema = z.enum([
  "CONNECTED",
  "EXPIRED",
  "REVOKED",
]);

export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;

export const socialConnectionItemSchema = z.object({
  id: z.string(),
  platform: socialPlatformSchema,
  platformUserName: z.string(),
  avatarUrl: z.string().nullable(),
  status: connectionStatusSchema,
  connectedAt: z.iso.datetime(),
});

export type SocialConnectionItem = z.infer<typeof socialConnectionItemSchema>;

export const getSocialConnectionsOutputSchema = z.array(
  socialConnectionItemSchema
);

export type GetSocialConnectionsOutput = z.infer<
  typeof getSocialConnectionsOutputSchema
>;

export const disconnectSocialInputSchema = z.object({
  platform: socialPlatformSchema,
});

export type DisconnectSocialInput = z.infer<typeof disconnectSocialInputSchema>;

export const getOAuthUrlInputSchema = z.object({
  platform: socialPlatformSchema,
  redirectUri: z.string().min(1),
});

export type GetOAuthUrlInput = z.infer<typeof getOAuthUrlInputSchema>;

export const getOAuthUrlOutputSchema = z.object({
  url: z.url(),
});

export type GetOAuthUrlOutput = z.infer<typeof getOAuthUrlOutputSchema>;

export const tikTokPrivacyLevelSchema = z.enum([
  "SELF_ONLY",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "PUBLIC_TO_EVERYONE",
]);

export type TikTokPrivacyLevel = z.infer<typeof tikTokPrivacyLevelSchema>;

export const targetOutcomeStateSchema = z.enum([
  "published",
  "accepted",
  "processing",
  "scheduled",
  "failed",
  "not-submitted",
  "cancelled",
  "unknown",
]);

export type TargetOutcomeState = z.infer<typeof targetOutcomeStateSchema>;
