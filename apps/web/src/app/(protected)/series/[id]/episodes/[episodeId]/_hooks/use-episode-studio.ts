import type {
  EpisodeCustomization,
  GetEpisodeByIdOutput,
  SeriesEpisodeAudioMetadata,
  StudioSceneItem,
} from "@faceless/contracts/series";
import type { VideoCompositionProps } from "@faceless/remotion";
import type { CallbackListener, PlayerRef } from "@remotion/player";
import * as React from "react";

const FPS = 30;
const DEFAULT_PREVIEW_DURATION_SECONDS = 30;

const noop = () => {
  // no-op listener cleanup
};

export interface UseEpisodeStudioOptions {
  initialData: GetEpisodeByIdOutput;
  seriesId: string;
}

export const useEpisodeStudio = ({
  initialData,
  seriesId,
}: UseEpisodeStudioOptions) => {
  const [episode, setEpisode] = React.useState(initialData.episode);

  const [scenes, setScenes] = React.useState<StudioSceneItem[]>(
    initialData.scenes
  );

  const [isAudioStale, setIsAudioStale] = React.useState(false);

  const [customization, setCustomization] =
    React.useState<EpisodeCustomization>(() => {
      const persisted = initialData.episode.metadata?.customization;

      if (persisted) {
        return persisted;
      }

      return {
        captionStyleId: initialData.series.captionStyleId,
        bgmUrl: initialData.series.customMusicUrl,
        glitchEffect: initialData.series.glitchEffect,
      };
    });

  const playerRef = React.useRef<PlayerRef | null>(null);

  const [playerInstance, setPlayerInstance] = React.useState<PlayerRef | null>(
    null
  );

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentFrame, setCurrentFrame] = React.useState(0);

  const setPlayerRef = React.useCallback((node: PlayerRef | null) => {
    playerRef.current = node;
    setPlayerInstance(node);
  }, []);

  const totalDurationSeconds = React.useMemo(() => {
    const audioDur = episode.metadata?.audio?.audioDuration;

    if (audioDur !== undefined && audioDur > 0) {
      return audioDur;
    }

    const sceneDurationSum = scenes.reduce(
      (acc, scene) => acc + scene.duration,
      0
    );

    return sceneDurationSum > 0
      ? sceneDurationSum
      : DEFAULT_PREVIEW_DURATION_SECONDS;
  }, [episode.metadata?.audio?.audioDuration, scenes]);

  const durationInFrames = React.useMemo(
    () => Math.max(1, Math.round(totalDurationSeconds * FPS)),
    [totalDurationSeconds]
  );

  const compositionProps: VideoCompositionProps = React.useMemo(
    () => ({
      voiceUrl: episode.audioUrl ?? "",
      audioDuration: totalDurationSeconds,
      wordTimestamps: episode.metadata?.audio?.wordTimestamps ?? [],
      scenes,
      captionStyleId: customization.captionStyleId,
      bgmUrl: customization.bgmUrl,
      glitchEffect: customization.glitchEffect,
    }),
    [
      episode.audioUrl,
      episode.metadata?.audio?.wordTimestamps,
      scenes,
      customization,
      totalDurationSeconds,
    ]
  );

  const togglePlay = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  }, []);

  const seekToFrame = React.useCallback(
    (frame: number) => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      const clampedFrame = Math.max(0, Math.min(frame, durationInFrames));
      player.seekTo(clampedFrame);
      setCurrentFrame(clampedFrame);
    },
    [durationInFrames]
  );

  const seekToScene = React.useCallback(
    (sceneNumber: number) => {
      let offsetSeconds = 0;

      for (const scene of scenes) {
        if (scene.sceneNumber === sceneNumber) {
          break;
        }

        offsetSeconds += scene.duration;
      }

      seekToFrame(Math.round(offsetSeconds * FPS));
    },
    [scenes, seekToFrame]
  );

  const updateCustomizationState = React.useCallback(
    (partial: Partial<EpisodeCustomization>) => {
      setCustomization((prev) => ({
        ...prev,
        ...partial,
      }));
    },
    []
  );

  const updateSceneLocally = React.useCallback(
    (sceneNumber: number, patch: Partial<StudioSceneItem>) => {
      setScenes((prev) =>
        prev.map((scene) =>
          scene.sceneNumber === sceneNumber ? { ...scene, ...patch } : scene
        )
      );
    },
    []
  );

  const onAudioRegenerated = React.useCallback(
    (audioUrl: string, audioMetadata: SeriesEpisodeAudioMetadata) => {
      setEpisode((prev) => {
        if (!prev.metadata) {
          return {
            ...prev,
            audioUrl,
          };
        }

        return {
          ...prev,
          audioUrl,
          metadata: {
            ...prev.metadata,
            audio: audioMetadata,
            customization,
          },
        };
      });
      setIsAudioStale(false);
    },
    [customization]
  );

  const onStatusUpdated = React.useCallback(
    (status: GetEpisodeByIdOutput["episode"]["status"]) => {
      setEpisode((prev) => ({
        ...prev,
        status,
      }));
    },
    []
  );

  React.useEffect(() => {
    if (!playerInstance) {
      return noop;
    }

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onFrameUpdate: CallbackListener<"frameupdate"> = ({ detail }) => {
      setCurrentFrame(detail.frame);
    };

    playerInstance.addEventListener("play", onPlay);
    playerInstance.addEventListener("pause", onPause);
    playerInstance.addEventListener("frameupdate", onFrameUpdate);

    return () => {
      playerInstance.removeEventListener("play", onPlay);
      playerInstance.removeEventListener("pause", onPause);
      playerInstance.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [playerInstance]);

  return {
    seriesId,
    series: initialData.series,
    episode,
    scenes,
    customization,
    isAudioStale,
    setIsAudioStale,
    playerRef,
    setPlayerRef,
    isPlaying,
    currentFrame,
    currentTimeSeconds: currentFrame / FPS,
    totalDurationSeconds,
    durationInFrames,
    compositionProps,
    togglePlay,
    seekToFrame,
    seekToScene,
    updateCustomization: updateCustomizationState,
    updateSceneLocally,
    onAudioRegenerated,
    onStatusUpdated,
  };
};
