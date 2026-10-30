"use client";

import { MainVideo } from "@faceless/remotion";
import { Button } from "@faceless/ui/components/button";
import { Slider } from "@faceless/ui/components/slider";
import { Spinner } from "@faceless/ui/components/spinner";
import { Player } from "@remotion/player";
import { Maximize2, Pause, Play, Repeat, Volume2, VolumeX } from "lucide-react";
import * as React from "react";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const FPS = 30;

const formatTimestamp = (seconds: number): string => {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const remainingSecs = safeSec % 60;

  return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
};

const emptySubscribe = () => () => {
  // no-op unsubscribe
};

const useIsMounted = () =>
  React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export const EpisodeVideoPreview = () => {
  const {
    playerRef,
    setPlayerRef,
    compositionProps,
    durationInFrames,
    totalDurationSeconds,
    currentFrame,
    currentTimeSeconds,
    isPlaying,
    scenes,
    togglePlay,
    seekToFrame,
    seekToScene,
  } = useEpisodeStudioContext();

  const isMounted = useIsMounted();
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(true);

  // Compute scene time ranges sequentially
  const sceneIntervals = React.useMemo(() => {
    const intervals: { sceneNumber: number; start: number; end: number }[] = [];
    let start = 0;

    for (const sc of scenes) {
      intervals.push({
        sceneNumber: sc.sceneNumber,
        start,
        end: start + sc.duration,
      });
      start += sc.duration;
    }

    return intervals;
  }, [scenes]);

  const activeSceneNumber = React.useMemo(() => {
    const match = sceneIntervals.find(
      (inv) => currentTimeSeconds >= inv.start && currentTimeSeconds < inv.end
    );

    return match?.sceneNumber ?? scenes[0]?.sceneNumber ?? 1;
  }, [sceneIntervals, currentTimeSeconds, scenes]);

  const handleMuteToggle = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isMuted()) {
      player.unmute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, [playerRef]);

  const handleFullscreen = React.useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isFullscreen()) {
      player.exitFullscreen();
    } else {
      player.requestFullscreen();
    }
  }, [playerRef]);

  const handleSliderChange = React.useCallback(
    (values: number | readonly number[]) => {
      const val = Array.isArray(values)
        ? Number(values[0] ?? 0)
        : Number(values);

      seekToFrame(val);
    },
    [seekToFrame]
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Sleek Preview Enclosure */}
      <div className="mx-auto flex w-full max-w-[340px] flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs sm:max-w-[360px]">
        {/* 9:16 Vertical Screen Frame */}
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-black">
          {isMounted ? (
            <Player
              acknowledgeRemotionLicense
              autoPlay={false}
              className="size-full object-contain"
              clickToPlay
              component={MainVideo}
              compositionHeight={1920}
              compositionWidth={1080}
              controls={false}
              durationInFrames={durationInFrames}
              fps={FPS}
              inputProps={compositionProps}
              loop={isLooping}
              ref={setPlayerRef}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted text-muted-foreground">
              <Spinner />
              <span className="text-xs font-medium">
                Initializing Player...
              </span>
            </div>
          )}
        </div>

        {/* Integrated Scrubber & Controls */}
        <div className="flex flex-col gap-2.5 px-0.5 pt-1">
          {/* Timeline Slider */}
          <Slider
            aria-label="Video scrubber"
            className="cursor-pointer"
            max={durationInFrames}
            min={0}
            onValueChange={handleSliderChange}
            value={[currentFrame]}
          />

          {/* Control buttons & time display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                aria-label={isPlaying ? "Pause video" : "Play video"}
                onClick={togglePlay}
                size="icon"
                variant="default"
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>

              <Button
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                onClick={handleMuteToggle}
                size="icon"
                variant="ghost"
              >
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>

              <Button
                aria-label="Toggle loop"
                onClick={() => {
                  setIsLooping((prev) => !prev);
                }}
                size="icon"
                variant={isLooping ? "secondary" : "ghost"}
              >
                <Repeat />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                <strong className="text-foreground">
                  {formatTimestamp(currentTimeSeconds)}
                </strong>
                {" / "}
                {formatTimestamp(totalDurationSeconds)}
              </span>

              <Button
                aria-label="Fullscreen preview"
                onClick={handleFullscreen}
                size="icon"
                variant="ghost"
              >
                <Maximize2 />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scene Jump Strip */}
      {scenes.length > 0 && (
        <div className="mx-auto flex w-full max-w-[340px] flex-col gap-1.5 sm:max-w-[360px]">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Jump to Scene
            </span>
            <span className="text-xs text-muted-foreground">
              {scenes.length} Scenes
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {scenes.map((scene) => {
              const isActive = activeSceneNumber === scene.sceneNumber;

              return (
                <Button
                  key={scene.id}
                  onClick={() => {
                    seekToScene(scene.sceneNumber);
                  }}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                >
                  #{scene.sceneNumber}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
