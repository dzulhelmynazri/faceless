import { runScriptwriterAgent } from "@faceless/agent";
import {
  captionStyleIdSchema,
  generateEpisodeAudioInputSchema,
  generateEpisodeAudioOutputSchema,
  generateEpisodeInputSchema,
  generateEpisodeOutputSchema,
  getEpisodeByIdInputSchema,
  getEpisodeByIdOutputSchema,
  publishEpisodeNowInputSchema,
  publishEpisodeNowOutputSchema,
  regenerateEpisodeSceneInputSchema,
  regenerateEpisodeSceneOutputSchema,
  renderEpisodeInputSchema,
  renderEpisodeOutputSchema,
  seriesEpisodeMetadataSchema,
  updateEpisodeCustomizationInputSchema,
  updateEpisodeCustomizationOutputSchema,
  updateEpisodeSceneInputSchema,
  updateEpisodeSceneOutputSchema,
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
import {
  generateEpisodeScenes,
  regenerateSingleScene,
} from "../../services/visual";
import type {
  GenerateEpisodeScenesOutput,
  GeneratedSceneRecord,
} from "../../services/visual";
import { synthesizeVoiceover } from "../../services/voiceover";
import type { SynthesizeVoiceoverOutput } from "../../services/voiceover";
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

      let voiceover: SynthesizeVoiceoverOutput;

      try {
        voiceover = await synthesizeVoiceover({
          userId: series.userId,
          seriesId: series.id,
          episodeId: episode.id,
          rawNarration: script.fullNarration,
          voiceId: series.voiceId,
          storage: ctx.files,
        });
      } catch {
        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            status: "FAILED",
            error: "Failed to synthesize voiceover audio",
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to synthesize voiceover audio",
        });
      }

      let visualResult: GenerateEpisodeScenesOutput;

      try {
        visualResult = await generateEpisodeScenes({
          userId: series.userId,
          seriesId: series.id,
          episodeId: episode.id,
          artStyleId: series.artStyleId,
          scenes: script.scenes,
          wordTimestamps: voiceover.metadata.wordTimestamps,
          audioDuration: voiceover.metadata.audioDuration,
          storage: ctx.files,
        });
      } catch {
        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            audioUrl: voiceover.audioUrl,
            status: "FAILED",
            error: "Failed to generate visual assets for episode",
            metadata: {
              script,
              audio: voiceover.metadata,
            },
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate visual assets for episode",
        });
      }

      await ctx.db.$transaction([
        ctx.db.seriesEpisodeScene.createMany({
          data: visualResult.scenes.map((scene) => ({
            episodeId: episode.id,
            sceneNumber: scene.sceneNumber,
            narrationText: scene.narrationText,
            visualPrompt: scene.visualPrompt,
            imageUrl: scene.imageUrl,
            imageKey: scene.imageKey,
            duration: scene.duration,
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
    }),

  generateEpisodeAudio: protectedProcedure
    .input(generateEpisodeAudioInputSchema)
    .output(generateEpisodeAudioOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const episode = await ctx.db.seriesEpisode.findFirst({
        where: {
          id: input.episodeId,
          series: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          series: true,
        },
      });

      if (!episode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Episode not found",
        });
      }

      const parsedMetadata = seriesEpisodeMetadataSchema.safeParse(
        episode.metadata
      );

      if (!parsedMetadata.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Episode script metadata is invalid or missing",
        });
      }

      const voiceId = input.voiceIdOverride ?? episode.series.voiceId;
      const rawNarration = episode.script;

      let voiceover: SynthesizeVoiceoverOutput;

      try {
        voiceover = await synthesizeVoiceover({
          userId: episode.series.userId,
          seriesId: episode.seriesId,
          episodeId: episode.id,
          rawNarration,
          voiceId,
          storage: ctx.files,
        });
      } catch {
        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            status: "FAILED",
            error: "Failed to synthesize voiceover audio",
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to synthesize voiceover audio",
        });
      }

      await ctx.db.seriesEpisode.update({
        where: { id: episode.id },
        data: {
          audioUrl: voiceover.audioUrl,
          status: "READY_FOR_REVIEW",
          error: null,
          metadata: {
            script: parsedMetadata.data.script,
            audio: voiceover.metadata,
          },
        },
      });

      return {
        episodeId: episode.id,
        audioUrl: voiceover.audioUrl,
        metadata: voiceover.metadata,
      };
    }),

  regenerateEpisodeScene: protectedProcedure
    .input(regenerateEpisodeSceneInputSchema)
    .output(regenerateEpisodeSceneOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const episode = await ctx.db.seriesEpisode.findFirst({
        where: {
          id: input.episodeId,
          series: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          series: true,
          scenes: {
            where: {
              sceneNumber: input.sceneNumber,
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

      const [existingScene] = episode.scenes;

      if (!existingScene) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Scene #${input.sceneNumber} not found`,
        });
      }

      let generated: GeneratedSceneRecord;

      try {
        generated = await regenerateSingleScene({
          userId: episode.series.userId,
          seriesId: episode.seriesId,
          episodeId: episode.id,
          artStyleId: episode.series.artStyleId,
          sceneNumber: existingScene.sceneNumber,
          narrationChunk: existingScene.narrationText,
          visualPrompt: existingScene.visualPrompt,
          duration: existingScene.duration,
          promptOverride: input.promptOverride,
          storage: ctx.files,
        });
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to regenerate scene #${input.sceneNumber}`,
        });
      }

      const updatedScene = await ctx.db.seriesEpisodeScene.update({
        where: {
          episodeId_sceneNumber: {
            episodeId: episode.id,
            sceneNumber: existingScene.sceneNumber,
          },
        },
        data: {
          imageUrl: generated.imageUrl,
          imageKey: generated.imageKey,
          visualPrompt: generated.visualPrompt,
        },
      });

      let nextThumbnailUrl = episode.thumbnailUrl;

      if (input.sceneNumber === 1) {
        nextThumbnailUrl = generated.imageUrl;
        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            thumbnailUrl: generated.imageUrl,
          },
        });
      }

      return {
        success: true,
        scene: {
          id: updatedScene.id,
          sceneNumber: updatedScene.sceneNumber,
          narrationText: updatedScene.narrationText,
          visualPrompt: updatedScene.visualPrompt,
          imageUrl: updatedScene.imageUrl,
          duration: updatedScene.duration,
        },
        thumbnailUrl: nextThumbnailUrl,
      };
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
          },
        },
      });

      if (!episode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Episode not found",
        });
      }

      const parsedMetadata = seriesEpisodeMetadataSchema.safeParse(
        episode.metadata
      );

      const safeMetadata = parsedMetadata.success ? parsedMetadata.data : null;

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
          metadata: safeMetadata,
          createdAt: episode.createdAt.toISOString(),
          updatedAt: episode.updatedAt.toISOString(),
        },
        series: {
          ...episode.series,
          captionStyleId: captionStyleIdSchema.parse(
            episode.series.captionStyleId
          ),
        },
        scenes: episode.scenes.map((s) => ({
          id: s.id,
          sceneNumber: s.sceneNumber,
          narrationText: s.narrationText,
          visualPrompt: s.visualPrompt,
          imageUrl: s.imageUrl,
          duration: s.duration,
        })),
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

      const parsedMetadata = seriesEpisodeMetadataSchema.safeParse(
        episode.metadata
      );

      const currentMetadata = parsedMetadata.success
        ? parsedMetadata.data
        : undefined;

      const updatedMetadata = {
        ...currentMetadata,
        customization: {
          ...currentMetadata?.customization,
          ...input.customization,
        },
      };

      await ctx.db.seriesEpisode.update({
        where: { id: episode.id },
        data: {
          metadata: updatedMetadata,
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
          ...(input.status !== "FAILED" && { error: null }),
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

  updateEpisodeScene: protectedProcedure
    .input(updateEpisodeSceneInputSchema)
    .output(updateEpisodeSceneOutputSchema)
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

      const existingScene = await ctx.db.seriesEpisodeScene.findUnique({
        where: {
          episodeId_sceneNumber: {
            episodeId: episode.id,
            sceneNumber: input.sceneNumber,
          },
        },
      });

      if (!existingScene) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Scene #${input.sceneNumber} not found`,
        });
      }

      const updateData = {
        ...(input.narrationText !== undefined && {
          narrationText: input.narrationText,
        }),
        ...(input.visualPrompt !== undefined && {
          visualPrompt: input.visualPrompt,
        }),
      };

      const updatedScene = await ctx.db.seriesEpisodeScene.update({
        where: {
          episodeId_sceneNumber: {
            episodeId: episode.id,
            sceneNumber: input.sceneNumber,
          },
        },
        data: updateData,
      });

      let updatedScript: string | undefined;

      if (input.narrationText !== undefined) {
        const allScenes = await ctx.db.seriesEpisodeScene.findMany({
          where: { episodeId: episode.id },
          orderBy: { sceneNumber: "asc" },
        });

        updatedScript = allScenes.map((s) => s.narrationText).join("\n\n");

        await ctx.db.seriesEpisode.update({
          where: { id: episode.id },
          data: {
            script: updatedScript,
          },
        });
      }

      return {
        success: true,
        scene: {
          id: updatedScene.id,
          sceneNumber: updatedScene.sceneNumber,
          narrationText: updatedScene.narrationText,
          visualPrompt: updatedScene.visualPrompt,
          imageUrl: updatedScene.imageUrl,
          duration: updatedScene.duration,
        },
        updatedScript,
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
