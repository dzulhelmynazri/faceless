import {
  disconnectSocialInputSchema,
  getOAuthUrlInputSchema,
  getOAuthUrlOutputSchema,
  getSocialConnectionsOutputSchema,
  PLATFORM_TO_SDK_MAP,
  publishVideoInputSchema,
  publishVideoOutputSchema,
  SDK_TO_PLATFORM_MAP,
} from "@faceless/contracts/social";
import type {
  PublishOutcomeItem,
  SocialPlatform,
} from "@faceless/contracts/social";
import { publishVideoToSocials } from "@faceless/socials";
import type { SocialAccountTarget } from "@faceless/socials";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../middlewares/auth";
import { router } from "../trpc";

export const socialRouter = router({
  getConnections: protectedProcedure
    .output(getSocialConnectionsOutputSchema)
    .query(async ({ ctx }) => {
      const connections = await ctx.db.socialConnection.findMany({
        where: {
          userId: ctx.session.user.id,
          status: "CONNECTED",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return connections.map((conn) => ({
        id: conn.id,
        platform: conn.platform,
        platformUserName: conn.platformUserName,
        avatarUrl: conn.avatarUrl,
        status: conn.status,
        connectedAt: conn.createdAt.toISOString(),
      }));
    }),

  disconnect: protectedProcedure
    .input(disconnectSocialInputSchema)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.socialConnection.findFirst({
        where: {
          userId: ctx.session.user.id,
          platform: input.platform,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No active connection found for ${input.platform}`,
        });
      }

      await ctx.db.socialConnection.delete({
        where: {
          id: existing.id,
        },
      });

      return { success: true };
    }),

  getOAuthUrl: protectedProcedure
    .input(getOAuthUrlInputSchema)
    .output(getOAuthUrlOutputSchema)
    .mutation(({ ctx, input }) => {
      const platformParam = PLATFORM_TO_SDK_MAP[input.platform];

      const state = encodeURIComponent(
        JSON.stringify({ platform: input.platform, ts: Date.now() })
      );

      const url = `${ctx.baseUrl}/api/social/oauth/${platformParam}?state=${state}&redirect_uri=${encodeURIComponent(
        input.redirectUri
      )}`;

      return { url };
    }),

  publishVideo: protectedProcedure
    .input(publishVideoInputSchema)
    .output(publishVideoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedPlatforms = input.targets.map((t) => t.platform);

      const connections = await ctx.db.socialConnection.findMany({
        where: {
          userId: ctx.session.user.id,
          status: "CONNECTED",
          platform: { in: requestedPlatforms },
        },
      });

      const connectionMap = new Map<
        SocialPlatform,
        (typeof connections)[number]
      >();

      for (const conn of connections) {
        connectionMap.set(conn.platform, conn);
      }

      const sdkTargets: SocialAccountTarget[] = input.targets.map((target) => {
        const connection = connectionMap.get(target.platform);

        if (!connection) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Account for platform ${target.platform} is not connected`,
          });
        }

        switch (target.platform) {
          case "YOUTUBE": {
            return {
              platform: "youtube",
              accountId: connection.platformUserId,
              visibility: target.options.visibility,
              madeForKids: target.options.madeForKids,
            };
          }

          case "TIKTOK": {
            return {
              platform: "tiktok",
              accountId: connection.platformUserId,
              privacy: target.options.privacy,
              consentGiven: target.options.consentGiven,
              isDraft: target.options.isDraft,
              aiGenerated: target.options.aiGenerated,
              disableComments: target.options.disableComments,
              disableDuet: target.options.disableDuet,
              disableStitch: target.options.disableStitch,
              brandedContent: target.options.brandedContent,
              ownBrand: target.options.ownBrand,
            };
          }

          case "INSTAGRAM": {
            return {
              platform: "instagram",
              accountId: connection.platformUserId,
              shareToFeed: target.options.shareToFeed,
            };
          }

          default: {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Unsupported social platform",
            });
          }
        }
      });

      const publishResult = await publishVideoToSocials(ctx.socials, {
        videoUrl: input.videoUrl,
        title: input.title,
        description: input.description,
        idempotencyKey: input.idempotencyKey,
        targets: sdkTargets,
      });

      if (
        publishResult.status === "failed" &&
        publishResult.outcomes.length === 0
      ) {
        const issueMessages = publishResult.issues?.map(
          (issue) => issue.message
        );

        const errorMessage =
          issueMessages && issueMessages.length > 0
            ? issueMessages.join(", ")
            : "Video preparation failed before publishing";

        const failedOutcomes = await Promise.all(
          input.targets.map(async (target) => {
            const connection = connectionMap.get(target.platform);

            if (!connection) {
              return null;
            }

            const publication = await ctx.db.socialPublication.create({
              data: {
                error: errorMessage,
                platform: connection.platform,
                socialConnectionId: connection.id,
                status: "failed",
              },
            });

            const item: PublishOutcomeItem = {
              accountId: connection.platformUserId,
              error: errorMessage,
              platform: target.platform,
              publicationId: publication.id,
              state: "failed",
            };

            return item;
          })
        );

        return {
          outcomes: failedOutcomes.filter(
            (item): item is PublishOutcomeItem => item !== null
          ),
          status: "failed",
        };
      }

      const outcomes = await Promise.all(
        publishResult.outcomes.map(async (outcome) => {
          const platform = SDK_TO_PLATFORM_MAP[outcome.platform];
          const connection = connectionMap.get(platform);

          let publicationId: string | undefined;

          if (connection) {
            const publication = await ctx.db.socialPublication.create({
              data: {
                error: outcome.error,
                externalPostId: outcome.postId,
                metadata: {
                  deliveryId: outcome.deliveryId,
                  errorCode: outcome.errorCode,
                  jobId: outcome.jobId,
                  postUrl: outcome.postUrl,
                },
                platform: connection.platform,
                publishedAt: outcome.state === "published" ? new Date() : null,
                socialConnectionId: connection.id,
                status: outcome.state,
              },
            });

            publicationId = publication.id;
          }

          const item: PublishOutcomeItem = {
            accountId: outcome.accountId,
            deliveryId: outcome.deliveryId,
            error: outcome.error,
            errorCode: outcome.errorCode,
            jobId: outcome.jobId,
            platform,
            postId: outcome.postId,
            postUrl: outcome.postUrl,
            publicationId,
            state: outcome.state,
          };

          return item;
        })
      );

      return {
        outcomes,
        status: publishResult.status,
      };
    }),
});
