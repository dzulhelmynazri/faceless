"use client";

import { MainVideo } from "@faceless/remotion";
import { AspectRatio } from "@faceless/ui/components/aspect-ratio";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card } from "@faceless/ui/components/card";
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
    <Card className="items-center">
      {/* 9:16 Vertical Video Frame with Studio Aspect Ratio */}
      <AspectRatio
        className="w-full max-w-[340px] overflow-hidden sm:max-w-[360px]"
        ratio={9 / 16}
      >
        {isMounted ? (
          <Player
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
          <div className="flex size-full flex-col items-center justify-center gap-3 bg-black text-muted-foreground">
            <Spinner />
            <span className="text-xs font-medium">Initializing Player...</span>
          </div>
        )}

        {/* Top Floating Scene Badge */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2">
          <Badge variant="outline">9:16 Vertical HD</Badge>
          {compositionProps.glitchEffect === true && (
            <Badge variant="outline">Glitch FX</Badge>
          )}
        </div>
      </AspectRatio>

      {/* Scrubbing Bar & Controls */}
      <div className="flex w-full max-w-[360px] flex-col gap-3">
        {/* Timeline Slider */}
        <div className="flex items-center gap-2">
          <Slider
            aria-label="Video scrubber"
            className="cursor-pointer"
            max={durationInFrames}
            min={0}
            onValueChange={handleSliderChange}
            value={[currentFrame]}
          />
        </div>

        {/* Playback Button Controls & Time Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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
              variant="ghost"
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

        {/* Scene Navigation Quick Pills */}
        {scenes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground">
              Seek:
            </span>
            {scenes.map((scene) => (
              <Button
                key={scene.id}
                onClick={() => {
                  seekToScene(scene.sceneNumber);
                }}
                size="xs"
                variant="outline"
              >
                Scene {scene.sceneNumber}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
