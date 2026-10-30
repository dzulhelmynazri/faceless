import { isNonEmptyString } from "@faceless/utils";
import { connectedAccountRef } from "@opencoredev/social-sdk";
import type {
  DeliveryOutcome,
  PublishRequest,
  PublishTarget,
} from "@opencoredev/social-sdk";

import type { SocialClient } from "./client";
import type {
  InstagramTarget,
  PublishVideoInput,
  PublishVideoResult,
  SocialAccountTarget,
  TargetPublicationOutcome,
  TikTokTarget,
  YouTubeTarget,
} from "./types";

const buildYouTubeTarget = (
  target: YouTubeTarget,
  input: PublishVideoInput
): PublishTarget => ({
  account: connectedAccountRef({
    backend: "default",
    platform: "youtube",
    accountId: target.accountId,
  }),
  options: {
    title: input.title.slice(0, 100),
    visibility: target.visibility,
    madeForKids: target.madeForKids,
  },
});

const buildTikTokTarget = (target: TikTokTarget): PublishTarget => ({
  account: connectedAccountRef({
    backend: "default",
    platform: "tiktok",
    accountId: target.accountId,
  }),
  options: {
    privacy: target.privacy,
    consentGiven: target.consentGiven,
    draft: target.isDraft,
    aiGenerated: target.aiGenerated,
    disableComments: target.disableComments,
    disableDuet: target.disableDuet,
    disableStitch: target.disableStitch,
    brandedContent: target.brandedContent,
    ownBrand: target.ownBrand,
  },
});

const buildInstagramTarget = (target: InstagramTarget): PublishTarget => ({
  account: connectedAccountRef({
    backend: "default",
    platform: "instagram",
    accountId: target.accountId,
  }),
  options: {
    shareToFeed: target.shareToFeed,
  },
});

const buildPublishTarget = (
  target: SocialAccountTarget,
  input: PublishVideoInput
): PublishTarget => {
  switch (target.platform) {
    case "youtube": {
      return buildYouTubeTarget(target, input);
    }

    case "tiktok": {
      return buildTikTokTarget(target);
    }

    case "instagram": {
      return buildInstagramTarget(target);
    }

    default: {
      throw new Error(
        `Unsupported platform. Only "youtube", "tiktok", and "instagram" are supported.`
      );
    }
  }
};

const mapDeliveryOutcome = (
  outcome: DeliveryOutcome,
  targets: readonly SocialAccountTarget[]
): TargetPublicationOutcome => {
  const target = targets[outcome.targetIndex];

  if (!target) {
    throw new Error(`Target index ${outcome.targetIndex} not found in request`);
  }

  const { platform, accountId } = target;
  const deliveryId = outcome.delivery?.deliveryId;

  switch (outcome.state) {
    case "published": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "published",
        postId: outcome.post.postId,
        postUrl: outcome.url,
      };
    }

    case "accepted": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "accepted",
      };
    }

    case "processing": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "processing",
      };
    }

    case "scheduled": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "scheduled",
        jobId: outcome.job.jobId,
      };
    }

    case "failed": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "failed",
        errorCode: outcome.code,
        error: outcome.message,
      };
    }

    case "not-submitted": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "not-submitted",
        error: outcome.reason,
      };
    }

    case "cancelled": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "cancelled",
        error: outcome.reason,
      };
    }

    case "unknown": {
      return {
        platform,
        accountId,
        deliveryId,
        state: "unknown",
        error: isNonEmptyString(outcome.diagnostic)
          ? outcome.diagnostic
          : outcome.reason,
      };
    }

    default: {
      return {
        platform,
        accountId,
        deliveryId,
        state: "unknown",
        error: "Unrecognized delivery outcome state",
      };
    }
  }
};

export const publishVideoToSocials = async (
  client: SocialClient,
  input: PublishVideoInput
): Promise<PublishVideoResult> => {
  const targets = input.targets.map((target) =>
    buildPublishTarget(target, input)
  );

  const media: PublishRequest["content"]["media"] = [
    {
      kind: "video",
      mimeType: "video/mp4",
      source: {
        kind: "https-url",
        url: input.videoUrl,
      },
    },
  ];

  const content: PublishRequest["content"] = isNonEmptyString(input.description)
    ? { media, text: input.description }
    : { media };

  const request: PublishRequest = {
    targets,
    content,
    idempotencyKey: input.idempotencyKey,
  };

  const plan = client.posts.prepare(request);

  if (!plan.ok) {
    return {
      status: "failed",
      outcomes: [],
      issues: plan.issues,
    };
  }

  const rawResult = await client.posts.publish(request);

  const outcomes = rawResult.outcomes.map((outcome) =>
    mapDeliveryOutcome(outcome, input.targets)
  );

  return {
    status: rawResult.status,
    outcomes,
  };
};
