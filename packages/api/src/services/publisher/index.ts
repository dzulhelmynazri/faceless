import type { Database, SocialConnection } from "@faceless/db";
import { publishVideoToSocials } from "@faceless/socials";
import type {
  SocialAccountTarget,
  SocialClient,
  TargetPublicationOutcome,
} from "@faceless/socials";
import { isNonEmptyString } from "@faceless/utils";
import { TRPCError } from "@trpc/server";

export interface PublishEpisodeServiceInput {
  db: Database;
  episodeId: string;
  socials: SocialClient;
  userId: string;
}

export type PublishEpisodeServiceOutput =
  | {
      outcomes: TargetPublicationOutcome[];
      publishedAt: Date;
      status: "PUBLISHED";
      success: true;
    }
  | {
      outcomes: TargetPublicationOutcome[];
      status: "FAILED";
      success: false;
    };

export const buildTargetForPlatform = (
  conn: SocialConnection
): SocialAccountTarget => {
  if (conn.platform === "YOUTUBE") {
    return {
      accountId: conn.platformUserId,
      madeForKids: false,
      platform: "youtube",
      visibility: "public",
    };
  }

  if (conn.platform === "TIKTOK") {
    return {
      accountId: conn.platformUserId,
      aiGenerated: true,
      brandedContent: false,
      consentGiven: true,
      disableComments: false,
      disableDuet: false,
      disableStitch: false,
      isDraft: false,
      ownBrand: false,
      platform: "tiktok",
      privacy: "PUBLIC_TO_EVERYONE",
    };
  }

  return {
    accountId: conn.platformUserId,
    platform: "instagram",
    shareToFeed: true,
  };
};

const recordPublicationOutcomes = async (
  db: Database,
  episodeId: string,
  outcomes: readonly TargetPublicationOutcome[],
  accountByPlatformUserId: Map<string, SocialConnection>,
  now: Date
) => {
  let anySuccess = false;

  const records = [];

  for (const outcome of outcomes) {
    const conn = accountByPlatformUserId.get(outcome.accountId);

    if (conn) {
      if (
        outcome.state === "published" ||
        outcome.state === "accepted" ||
        outcome.state === "processing"
      ) {
        anySuccess = true;
      }

      records.push({
        error: outcome.error,
        episodeId,
        externalPostId: outcome.postId ?? outcome.deliveryId,
        platform: conn.platform,
        publishedAt: outcome.state === "published" ? now : undefined,
        socialConnectionId: conn.id,
        status: outcome.state,
      });
    }
  }

  if (records.length > 0) {
    await db.socialPublication.createMany({
      data: records,
    });
  }

  return { anySuccess };
};

export const publishEpisodeToSocials = async ({
  db,
  socials,
  episodeId,
  userId,
}: PublishEpisodeServiceInput): Promise<PublishEpisodeServiceOutput> => {
  const episode = await db.seriesEpisode.findFirst({
    include: {
      series: {
        include: {
          socialAccounts: {
            include: {
              socialConnection: true,
            },
          },
        },
      },
    },
    where: {
      id: episodeId,
      series: {
        userId,
      },
    },
  });

  if (!episode) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Episode not found or access denied",
    });
  }

  if (episode.status === "PUBLISHED") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Episode is already published",
    });
  }

  if (!isNonEmptyString(episode.videoUrl)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot publish episode without a pre-rendered video URL",
    });
  }

  const validAccounts: SocialConnection[] = [];

  for (const sa of episode.series.socialAccounts) {
    const conn = sa.socialConnection;

    if (conn.status === "CONNECTED") {
      validAccounts.push(conn);
    }
  }

  if (validAccounts.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No connected social media accounts found for this series",
    });
  }

  // Atomically claim the episode to lock and clear prior errors
  const claim = await db.seriesEpisode.updateMany({
    data: {
      error: null,
      status: "PUBLISHING",
    },
    where: {
      id: episode.id,
      status: { in: ["APPROVED", "FAILED"] },
    },
  });

  if (claim.count === 0) {
    if (episode.status === "PUBLISHING") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Episode is already being published",
      });
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Episode cannot be published in its current state (${episode.status})`,
    });
  }

  const accountByPlatformUserId = new Map(
    validAccounts.map((conn) => [conn.platformUserId, conn])
  );

  const targets = validAccounts.map((conn) => buildTargetForPlatform(conn));

  try {
    const publishResult = await publishVideoToSocials(socials, {
      description: episode.description,
      idempotencyKey: `episode_${episode.id}`,
      targets,
      title: episode.title,
      videoUrl: episode.videoUrl,
    });

    const now = new Date();

    const { anySuccess } = await recordPublicationOutcomes(
      db,
      episode.id,
      publishResult.outcomes,
      accountByPlatformUserId,
      now
    );

    if (anySuccess) {
      await db.seriesEpisode.update({
        data: {
          publishedAt: now,
          status: "PUBLISHED",
        },
        where: { id: episode.id },
      });

      return {
        outcomes: publishResult.outcomes,
        publishedAt: now,
        status: "PUBLISHED",
        success: true,
      };
    }

    const firstIssue = publishResult.issues?.[0]?.message;

    const firstOutcomeError = publishResult.outcomes.find((o) =>
      isNonEmptyString(o.error)
    )?.error;

    const failureError =
      firstIssue ??
      firstOutcomeError ??
      "Failed to publish to all target platforms";

    await db.seriesEpisode.update({
      data: {
        error: failureError,
        status: "FAILED",
      },
      where: { id: episode.id },
    });

    return {
      outcomes: publishResult.outcomes,
      status: "FAILED",
      success: false,
    };
  } catch {
    await db.seriesEpisode.update({
      data: {
        error: "Failed to publish episode to socials",
        status: "FAILED",
      },
      where: { id: episode.id },
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to publish episode to socials",
    });
  }
};
