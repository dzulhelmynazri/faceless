import {
  createSeriesInputSchema,
  createSeriesOutputSchema,
  deleteSeriesInputSchema,
  deleteSeriesOutputSchema,
  getSeriesByIdInputSchema,
  getSeriesByIdOutputSchema,
  getSeriesListOutputSchema,
} from "@faceless/contracts/series";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../middlewares/auth";
import { seriesProcedure } from "../middlewares/billing";
import { router } from "../trpc";

export const seriesRouter = router({
  create: seriesProcedure
    .input(createSeriesInputSchema)
    .output(createSeriesOutputSchema)
    .mutation(async ({ ctx, input }) => {
      let validConnections: { id: string }[] = [];

      if (input.socialConnectionIds.includes("__ALL__")) {
        validConnections = await ctx.db.socialConnection.findMany({
          where: {
            userId: ctx.session.user.id,
            status: "CONNECTED",
          },
          select: { id: true },
        });
      } else if (input.socialConnectionIds.length > 0) {
        validConnections = await ctx.db.socialConnection.findMany({
          where: {
            id: { in: input.socialConnectionIds },
            userId: ctx.session.user.id,
            status: "CONNECTED",
          },
          select: { id: true },
        });
      }

      const newSeries = await ctx.db.series.create({
        data: {
          userId: ctx.session.user.id,
          name: input.name,
          nichePresetId: input.nichePresetId,
          nichePrompt: input.nichePrompt,
          exampleScript: input.exampleScript,
          language: input.language,
          voiceId: input.voiceId,
          musicTrackId: input.musicTrackId,
          tiktokSounds: input.tiktokSounds,
          artStyleId: input.artStyleId,
          captionStyleId: input.captionStyleId,
          glitchEffect: input.glitchEffect,
          videoDuration: input.videoDuration,
          publishTime: input.publishTime,
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
              socialConnection: true,
            },
          },
          episodes: {
            orderBy: {
              episodeNumber: "asc",
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
          thumbnailUrl: ep.thumbnailUrl,
          scheduledFor: ep.scheduledFor ? ep.scheduledFor.toISOString() : null,
          publishedAt: ep.publishedAt ? ep.publishedAt.toISOString() : null,
          createdAt: ep.createdAt.toISOString(),
        })),
      };
    }),

  delete: protectedProcedure
    .input(deleteSeriesInputSchema)
    .output(deleteSeriesOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.series.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      await ctx.db.series.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
