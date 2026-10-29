import {
  createSeriesInputSchema,
  createSeriesOutputSchema,
  deleteSeriesInputSchema,
  deleteSeriesOutputSchema,
  getSeriesByIdInputSchema,
  getSeriesByIdOutputSchema,
  getSeriesListOutputSchema,
  updateSeriesInputSchema,
  updateSeriesOutputSchema,
  updateSeriesStatusInputSchema,
  updateSeriesStatusOutputSchema,
} from "@faceless/contracts/series";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../middlewares/auth";
import { seriesProcedure } from "../../middlewares/billing";
import { router } from "../../trpc";

export const seriesCoreRouter = router({
  create: seriesProcedure
    .input(createSeriesInputSchema)
    .output(createSeriesOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { socialConnectionIds, ...seriesFields } = input;

      const idFilter = socialConnectionIds.includes("__ALL__")
        ? undefined
        : { id: { in: socialConnectionIds } };

      const validConnections =
        socialConnectionIds.length === 0
          ? []
          : await ctx.db.socialConnection.findMany({
              where: {
                ...idFilter,
                userId: ctx.session.user.id,
                status: "CONNECTED",
              },
              select: { id: true },
            });

      const newSeries = await ctx.db.series.create({
        data: {
          ...seriesFields,
          userId: ctx.session.user.id,
          status: "ACTIVE",
          socialAccounts: {
            create: validConnections.map((conn) => ({
              socialConnectionId: conn.id,
            })),
          },
        },
      });

      return {
        success: true,
        seriesId: newSeries.id,
        name: newSeries.name,
      };
    }),

  list: protectedProcedure
    .output(getSeriesListOutputSchema)
    .query(async ({ ctx }) => {
      const seriesList = await ctx.db.series.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          socialAccounts: {
            include: {
              socialConnection: {
                select: {
                  platform: true,
                },
              },
            },
          },
          _count: {
            select: {
              episodes: true,
              socialAccounts: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return seriesList.map((item) => ({
        id: item.id,
        name: item.name,
        nichePresetId: item.nichePresetId,
        language: item.language,
        voiceId: item.voiceId,
        artStyleId: item.artStyleId,
        captionStyleId: item.captionStyleId,
        videoDuration: item.videoDuration,
        publishTime: item.publishTime,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        episodeCount: item._count.episodes,
        socialAccountCount: item._count.socialAccounts,
        platforms: item.socialAccounts.map(
          (sa) => sa.socialConnection.platform
        ),
      }));
    }),

  byId: protectedProcedure
    .input(getSeriesByIdInputSchema)
    .output(getSeriesByIdOutputSchema)
    .query(async ({ ctx, input }) => {
      const series = await ctx.db.series.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          socialAccounts: {
            include: {
              socialConnection: {
                select: {
                  platform: true,
                  platformUserName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          episodes: {
            orderBy: {
              episodeNumber: "asc",
            },
            include: {
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
          },
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      return {
        id: series.id,
        name: series.name,
        nichePresetId: series.nichePresetId,
        nichePrompt: series.nichePrompt,
        exampleScript: series.exampleScript,
        language: series.language,
        voiceId: series.voiceId,
        musicTrackId: series.musicTrackId,
        customMusicKey: series.customMusicKey,
        customMusicUrl: series.customMusicUrl,
        tiktokSounds: series.tiktokSounds,
        artStyleId: series.artStyleId,
        captionStyleId: series.captionStyleId,
        glitchEffect: series.glitchEffect,
        videoDuration: series.videoDuration,
        publishTime: series.publishTime,
        status: series.status,
        createdAt: series.createdAt.toISOString(),
        updatedAt: series.updatedAt.toISOString(),
        socialAccounts: series.socialAccounts.map((sa) => ({
          id: sa.id,
          socialConnectionId: sa.socialConnectionId,
          platform: sa.socialConnection.platform,
          platformUserName: sa.socialConnection.platformUserName,
          avatarUrl: sa.socialConnection.avatarUrl,
        })),
        episodes: series.episodes.map((ep) => ({
          id: ep.id,
          episodeNumber: ep.episodeNumber,
          title: ep.title,
          topic: ep.topic,
          status: ep.status,
          videoUrl: ep.videoUrl,
          audioUrl: ep.audioUrl,
          thumbnailUrl: ep.thumbnailUrl,
          scheduledFor: ep.scheduledFor?.toISOString() ?? null,
          publishedAt: ep.publishedAt?.toISOString() ?? null,
          createdAt: ep.createdAt.toISOString(),
          scenes: ep.scenes,
        })),
      };
    }),

  updateStatus: protectedProcedure
    .input(updateSeriesStatusInputSchema)
    .output(updateSeriesStatusOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.series.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
      }

      const updated = await ctx.db.series.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return {
        success: true,
        id: updated.id,
        status: updated.status,
      };
    }),

  update: protectedProcedure
    .input(updateSeriesInputSchema)
    .output(updateSeriesOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.series.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
      }

      const { id, ...fields } = input;

      await ctx.db.series.update({
        where: { id },
        data: fields,
      });

      return {
        success: true,
        id,
      };
    }),

  delete: protectedProcedure
    .input(deleteSeriesInputSchema)
    .output(deleteSeriesOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.series.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
      }

      await ctx.db.series.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
