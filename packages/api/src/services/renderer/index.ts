import {
  SERIES_MUSIC_PRESETS,
  captionStyleIdSchema,
  seriesEpisodeMetadataSchema,
} from "@faceless/contracts/series";
import type { Database } from "@faceless/db";
import type { VideoRendererService } from "@faceless/remotion/server";
import type { VideoCompositionProps } from "@faceless/remotion/types";
import type { Files } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import { TRPCError } from "@trpc/server";

export const calculateNextScheduledFor = (
  publishTime: string,
  baseDate = new Date()
): Date => {
  const match =
    /^(?<hours>\d{1,2}):(?<minutes>\d{2})\s*(?<meridiem>AM|PM)$/iu.exec(
      publishTime
    );

  if (!match?.groups) {
    throw new Error(`Invalid publish time: ${publishTime}`);
  }

  const {
    hours: rawHours,
    minutes: rawMinutes,
    meridiem: rawMeridiem,
  } = match.groups;

  if (
    !isNonEmptyString(rawHours) ||
    !isNonEmptyString(rawMinutes) ||
    !isNonEmptyString(rawMeridiem)
  ) {
    throw new Error(`Invalid publish time: ${publishTime}`);
  }

  let hours = Math.trunc(Number(rawHours));
  const minutes = Math.trunc(Number(rawMinutes));
  const isPm = rawMeridiem.toUpperCase() === "PM";

  if (isPm && hours < 12) {
    hours += 12;
  } else if (!isPm && hours === 12) {
    hours = 0;
  }

  const scheduled = new Date(baseDate);
  scheduled.setUTCHours(hours, minutes, 0, 0);

  if (scheduled.getTime() <= baseDate.getTime()) {
    scheduled.setUTCDate(scheduled.getUTCDate() + 1);
  }

  return scheduled;
};

export const resolveScheduledFor = (
  existingScheduledFor: Date | null,
  publishTime: string
): Date => {
  if (existingScheduledFor && existingScheduledFor > new Date()) {
    return existingScheduledFor;
  }

  return calculateNextScheduledFor(publishTime);
};

export interface RenderEpisodeServiceInput {
  callbackUrl: string;
  db: Database;
  episodeId: string;
  renderer: VideoRendererService;
  storage: Files;
  userId: string;
}

export type RenderEpisodeServiceOutput =
  | {
      scheduledFor: Date;
      status: "APPROVED";
      videoUrl: string;
    }
  | {
      status: "RENDERING";
    };

export const renderEpisodeVideo = async ({
  db,
  storage,
  episodeId,
  userId,
  renderer,
  callbackUrl,
}: RenderEpisodeServiceInput): Promise<RenderEpisodeServiceOutput> => {
  const episode = await db.seriesEpisode.findFirst({
    include: {
      scenes: {
        orderBy: { sceneNumber: "asc" },
      },
      series: true,
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

  if (episode.status === "RENDERING") {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Episode video is currently rendering",
    });
  }

  if (!isNonEmptyString(episode.audioUrl)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot render episode without synthesized audio",
    });
  }

  if (episode.scenes.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot render episode without scenes",
    });
  }

  const hasMissingSceneImage = episode.scenes.some(
    (scene) => !isNonEmptyString(scene.imageUrl)
  );

  if (hasMissingSceneImage) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot render episode with missing scene images",
    });
  }

  const parsedMetadata = seriesEpisodeMetadataSchema.safeParse(
    episode.metadata
  );

  if (!parsedMetadata.success || !parsedMetadata.data.audio) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Episode audio metadata is invalid or missing",
    });
  }

  const audioMetadata = parsedMetadata.data.audio;
  const { customization } = parsedMetadata.data;

  const rawCaptionStyle =
    customization?.captionStyleId ?? episode.series.captionStyleId;

  const parsedCaptionStyle = captionStyleIdSchema.safeParse(rawCaptionStyle);

  if (!parsedCaptionStyle.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid caption style",
    });
  }

  const captionStyleId = parsedCaptionStyle.data;

  const rawMusic = customization
    ? customization.bgmUrl
    : (episode.series.customMusicUrl ?? episode.series.musicTrackId);

  const bgmUrl =
    SERIES_MUSIC_PRESETS.find((preset) => preset.id === rawMusic)?.url ??
    rawMusic;

  const glitchEffect =
    customization?.glitchEffect ?? episode.series.glitchEffect;

  const compositionProps: VideoCompositionProps = {
    audioDuration: audioMetadata.audioDuration,
    bgmUrl,
    captionStyleId,
    glitchEffect,
    scenes: episode.scenes.map((scene) => ({
      duration: scene.duration,
      id: scene.id,
      imageUrl: scene.imageUrl,
      narrationText: scene.narrationText,
      sceneNumber: scene.sceneNumber,
      visualPrompt: scene.visualPrompt,
    })),
    voiceUrl: episode.audioUrl,
    wordTimestamps: audioMetadata.wordTimestamps,
  };

  // Transition state to RENDERING
  await db.seriesEpisode.update({
    data: {
      error: null,
      status: "RENDERING",
    },
    where: { id: episode.id },
  });

  try {
    const result = await renderer.renderVideo({
      callbackUrl,
      compositionProps,
      episodeId: episode.id,
      seriesId: episode.seriesId,
      storage,
      userId,
    });

    if (result.status === "completed") {
      const scheduledFor = resolveScheduledFor(
        episode.scheduledFor,
        episode.series.publishTime
      );

      await db.seriesEpisode.update({
        data: {
          scheduledFor,
          status: "APPROVED",
          videoUrl: result.videoUrl,
        },
        where: { id: episode.id },
      });

      return {
        scheduledFor,
        status: "APPROVED",
        videoUrl: result.videoUrl,
      };
    }

    return {
      status: "RENDERING",
    };
  } catch {
    await db.seriesEpisode.update({
      data: {
        error: "Video rendering failed",
        status: "FAILED",
      },
      where: { id: episode.id },
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Video rendering failed",
    });
  }
};
