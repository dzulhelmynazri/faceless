import { runScriptwriterAgent } from "@faceless/agent";
import {
  captionStyleIdSchema,
  generateEpisodeInputSchema,
  generateEpisodeOutputSchema,
  getEpisodeByIdInputSchema,
  getEpisodeByIdOutputSchema,
  publishEpisodeNowInputSchema,
  publishEpisodeNowOutputSchema,
  renderEpisodeInputSchema,
  renderEpisodeOutputSchema,
  seriesEpisodeMetadataSchema,
  updateEpisodeCustomizationInputSchema,
  updateEpisodeCustomizationOutputSchema,
  updateEpisodeStatusInputSchema,
  updateEpisodeStatusOutputSchema,
} from "@faceless/contracts/series";
import type { TargetPublicationOutcome } from "@faceless/socials";
import { isNonEmptyString } from "@faceless/utils";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../middlewares/auth";
import { publishEpisodeToSocials } from "../../services/publisher";
import {
  calculateNextScheduledFor,
  renderEpisodeVideo,
} from "../../services/renderer";
import { generateEpisodeScenes } from "../../services/visual";
import { synthesizeVoiceover } from "../../services/voiceover";
import { router } from "../../trpc";

const mapOutcome = (o: TargetPublicationOutcome) => ({
  accountId: o.accountId,
  error: o.error,
  platform: o.platform,
  postId: o.postId,
  postUrl: o.postUrl,
  state: o.state,
});

export const episodesRouter = router({
  generateEpisode: protectedProcedure
    .input(generateEpisodeInputSchema)
    .output(generateEpisodeOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const series = await ctx.db.series.findFirst({
        where: {
          id: input.seriesId,
          userId: ctx.session.user.id,
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      const previousEpisodes = await ctx.db.seriesEpisode.findMany({
        where: { seriesId: series.id },
        select: { title: true, episodeNumber: true },
        orderBy: { episodeNumber: "desc" },
        take: 20,
      });

      const nextEpisodeNumber = (previousEpisodes[0]?.episodeNumber ?? 0) + 1;

      const script = await runScriptwriterAgent({
        userId: series.userId,
        seriesId: series.id,
        nichePrompt: series.nichePrompt,
        exampleScript: series.exampleScript,
        language: series.language,
        duration: series.videoDuration,
        artStyleId: series.artStyleId,
        topicOverride: input.topicOverride,
        previousTitles: previousEpisodes.map((e) => e.title),
      });

      const episode = await ctx.db.seriesEpisode.create({
        data: {
          seriesId: series.id,
          episodeNumber: nextEpisodeNumber,
          title: script.title,
          topic: input.topicOverride ?? script.title,
          script: script.fullNarration,
          metadata: { script },
          status: "GENERATING",
        },
      });

      try {
        const voiceover = await synthesizeVoiceover({
          userId: series.userId,
          seriesId: series.id,
          episodeId: episode.id,
          rawNarration: script.fullNarration,
          voiceId: series.voiceId,
          storage: ctx.files,
        });

        const visualResult = await generateEpisodeScenes({
          userId: series.userId,
          seriesId: series.id,
          episodeId: episode.id,
          artStyleId: series.artStyleId,
          scenes: script.scenes,
          wordTimestamps: voiceover.metadata.wordTimestamps,
          audioDuration: voiceover.metadata.audioDuration,
          storage: ctx.files,
        });

        await ctx.db.$transaction([
          ctx.db.seriesEpisodeScene.createMany({
            data: visualResult.scenes.map((scene) => ({
              episodeId: episode.id,
              ...scene,
            })),
          }),
          ctx.db.seriesEpisode.update({
            where: { id: episode.id },
            data: {
              audioUrl: voiceover.audioUrl,
              thumbnailUrl: visualResult.thumbnailUrl,
              status: "READY_FOR_REVIEW",
              error: null,
              metadata: {
                script,
                audio: voiceover.metadata,
              },
            },
          }),
        ]);

        return {
          episodeId: episode.id,
          script,
          audioUrl: voiceover.audioUrl,
          thumbnailUrl: visualResult.thumbnailUrl,
          sceneCount: visualResult.scenes.length,
        };
      } catch {
        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            status: "FAILED",
            error: "Failed to generate episode assets",
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate episode assets",
        });
      }
    }),

  getEpisodeById: protectedProcedure
    .input(getEpisodeByIdInputSchema)
    .output(getEpisodeByIdOutputSchema)
    .query(async ({ ctx, input }) => {
      const episode = await ctx.db.seriesEpisode.findFirst({
        where: {
          id: input.episodeId,
          series: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          series: {
            select: {
              id: true,
              name: true,
              voiceId: true,
              captionStyleId: true,
              musicTrackId: true,
              customMusicUrl: true,
              glitchEffect: true,
            },
          },
          scenes: {
            orderBy: {
              sceneNumber: "asc",
            },
            select: {
              id: true,
              sceneNumber: true,
              narrationText: true,
              visualPrompt: true,
              imageUrl: true,
              duration: true,
            },
          },
        },
      });

      if (!episode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Episode not found",
        });
      }

      const metadata =
        seriesEpisodeMetadataSchema.safeParse(episode.metadata).data ?? null;

      return {
        episode: {
          id: episode.id,
          seriesId: episode.seriesId,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          topic: episode.topic,
          script: episode.script,
          status: episode.status,
          audioUrl: episode.audioUrl,
          thumbnailUrl: episode.thumbnailUrl,
          videoUrl: episode.videoUrl,
          error: episode.error,
          metadata,
          createdAt: episode.createdAt.toISOString(),
          updatedAt: episode.updatedAt.toISOString(),
        },
        series: {
          ...episode.series,
          captionStyleId: captionStyleIdSchema.parse(
            episode.series.captionStyleId
          ),
        },
        scenes: episode.scenes,
      };
    }),

  updateEpisodeCustomization: protectedProcedure
    .input(updateEpisodeCustomizationInputSchema)
    .output(updateEpisodeCustomizationOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const episode = await ctx.db.seriesEpisode.findFirst({
        where: {
          id: input.episodeId,
          series: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!episode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Episode not found",
        });
      }

      const current = seriesEpisodeMetadataSchema.safeParse(
        episode.metadata
      ).data;

      if (!current) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Episode metadata is invalid or missing",
        });
      }

      await ctx.db.seriesEpisode.update({
        where: { id: episode.id },
        data: {
          metadata: {
            ...current,
            customization: {
              ...current.customization,
              ...input.customization,
            },
          },
        },
      });

      return {
        success: true,
        customization: input.customization,
      };
    }),

  updateEpisodeStatus: protectedProcedure
    .input(updateEpisodeStatusInputSchema)
    .output(updateEpisodeStatusOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const episode = await ctx.db.seriesEpisode.findFirst({
        include: {
          series: true,
        },
        where: {
          id: input.episodeId,
          series: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!episode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Episode not found",
        });
      }

      // If user marks APPROVED and video is not rendered yet, trigger rendering
      if (input.status === "APPROVED" && !isNonEmptyString(episode.videoUrl)) {
        const renderResult = await renderEpisodeVideo({
          callbackUrl: `${ctx.baseUrl}/api/render/webhook`,
          db: ctx.db,
          episodeId: episode.id,
          renderer: ctx.videoRenderer,
          storage: ctx.files,
          userId: ctx.session.user.id,
        });

        return {
          status: renderResult.status,
          success: true,
        };
      }

      const scheduledFor =
        input.status === "APPROVED" &&
        (!episode.scheduledFor || episode.scheduledFor <= new Date())
          ? calculateNextScheduledFor(episode.series.publishTime)
          : undefined;

      const updated = await ctx.db.seriesEpisode.update({
        data: {
          error: input.status === "FAILED" ? undefined : null,
          scheduledFor,
          status: input.status,
        },
        where: { id: episode.id },
      });

      return {
        status: updated.status,
        success: true,
      };
    }),

  renderEpisode: protectedProcedure
    .input(renderEpisodeInputSchema)
    .output(renderEpisodeOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await renderEpisodeVideo({
        callbackUrl: `${ctx.baseUrl}/api/render/webhook`,
        db: ctx.db,
        episodeId: input.episodeId,
        renderer: ctx.videoRenderer,
        storage: ctx.files,
        userId: ctx.session.user.id,
      });

      return {
        status: result.status,
        success: true,
        videoUrl: result.status === "APPROVED" ? result.videoUrl : null,
      };
    }),

  publishEpisodeNow: protectedProcedure
    .input(publishEpisodeNowInputSchema)
    .output(publishEpisodeNowOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await publishEpisodeToSocials({
        db: ctx.db,
        episodeId: input.episodeId,
        socials: ctx.socials,
        userId: ctx.session.user.id,
      });

      return {
        outcomes: result.outcomes.map(mapOutcome),
        publishedAt:
          result.status === "PUBLISHED"
            ? result.publishedAt.toISOString()
            : null,
        status: result.status,
        success: result.success,
      };
    }),
});
