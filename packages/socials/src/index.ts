export {
  createSocialClient,
  type SocialClient,
  type SocialClientOptions,
} from "./client";

export {
  createPlatformConnectionUrl,
  type CreatePlatformConnectionInput,
} from "./connection";

export { publishVideoToSocials } from "./publisher";

export {
  verifyAndDecodeSocialWebhook,
  type DecodedSocialWebhookEvent,
  type WebhookVerificationInput,
} from "./webhook";

export type {
  SupportedSocialPlatform,
  TargetOutcomeState,
  TikTokPrivacyLevel,
} from "@faceless/contracts/social";

export type {
  InstagramTarget,
  PublishVideoInput,
  PublishVideoResult,
  SocialAccountTarget,
  TargetPublicationOutcome,
  TikTokTarget,
  YouTubeTarget,
  YouTubeVisibility,
} from "./types";
