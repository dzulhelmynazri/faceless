import type {
  SupportedSocialPlatform,
  TargetOutcomeState,
  TikTokPrivacyLevel,
} from "@faceless/contracts/social";
import type {
  PreparationIssue,
  PublicationStatus,
} from "@opencoredev/social-sdk";

/** YouTube visibility options. */
export type YouTubeVisibility = "private" | "unlisted" | "public";

export interface YouTubeTarget {
  platform: "youtube";
  accountId: string;
  /** Required. No default — caller must declare intent. */
  visibility: YouTubeVisibility;
  /** Required. No default — caller must declare intent. */
  madeForKids: boolean;
}

export interface TikTokTarget {
  platform: "tiktok";
  accountId: string;
  /**
   * Required. Must be chosen by the creator from `privacyLevels` returned by
   * creator-info preflight. Never selected automatically by the SDK.
   * Docs: https://social-sdk.dev/docs/platforms/tiktok#fetch-creator-info-before-publishing
   */
  privacy: TikTokPrivacyLevel;
  /**
   * Required. Indicates the creator has completed Music Usage Confirmation
   * and consented to the upload. Never assume true.
   */
  consentGiven: boolean;
  /** Send to creator inbox (draft: true) vs Direct Post (draft: false). Required. */
  isDraft: boolean;
  /** Required — TikTok adapter rejects if not explicitly set. */
  aiGenerated: boolean;
  disableComments: boolean;
  disableDuet: boolean;
  disableStitch: boolean;
  brandedContent: boolean;
  ownBrand: boolean;
}

export interface InstagramTarget {
  platform: "instagram";
  accountId: string;
  shareToFeed: boolean;
}

export type SocialAccountTarget =
  | YouTubeTarget
  | TikTokTarget
  | InstagramTarget;

export interface PublishVideoInput {
  title: string;
  description?: string;
  videoUrl: string;
  tags?: string[];
  idempotencyKey: string;
  targets: SocialAccountTarget[];
}

export interface TargetPublicationOutcome {
  platform: SupportedSocialPlatform;
  accountId: string;
  state: TargetOutcomeState;
  postId?: string;
  postUrl?: string;
  deliveryId?: string;
  jobId?: string;
  error?: string;
  errorCode?: string;
}

export interface PublishVideoResult {
  status: PublicationStatus | "failed";
  outcomes: TargetPublicationOutcome[];
  issues?: readonly PreparationIssue[];
}
