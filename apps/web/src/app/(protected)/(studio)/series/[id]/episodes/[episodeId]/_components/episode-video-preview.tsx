"use client";

import { MainVideo } from "@faceless/remotion";
import { Spinner } from "@faceless/ui/components/spinner";
import { Player } from "@remotion/player";
import * as React from "react";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const FPS = 30;

// oxlint-disable shadcn/no-inline-styles -- Remotion Player requires style.width/height to compute canvas scale
const PLAYER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
};
// oxlint-enable shadcn/no-inline-styles

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
  const { compositionProps, durationInFrames, setPlayerRef } =
    useEpisodeStudioContext();

  const isMounted = useIsMounted();

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black shadow-lg">
      {isMounted ? (
        <Player
          acknowledgeRemotionLicense
          autoPlay={false}
          clickToPlay
          component={MainVideo}
          compositionHeight={1920}
          compositionWidth={1080}
          controls
          doubleClickToFullscreen
          durationInFrames={durationInFrames}
          fps={FPS}
          inputProps={compositionProps}
          loop
          ref={setPlayerRef}
          showVolumeControls
          spaceKeyToPlayOrPause
          style={PLAYER_STYLE}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-muted text-muted-foreground">
          <Spinner />
          <span className="text-xs font-medium">Initializing Player...</span>
        </div>
      )}
    </div>
  );
};
