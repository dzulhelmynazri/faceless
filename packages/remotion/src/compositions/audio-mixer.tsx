import type { WordTimestamp } from "@faceless/contracts/series";
import { isNonEmptyString } from "@faceless/utils";
import * as React from "react";
import { Html5Audio, useCurrentFrame, useVideoConfig } from "remotion";

import {
  computeSpeechIntervals,
  resolveDuckingVolume,
} from "../core/speech-envelope";

export interface AudioMixerProps {
  voiceUrl: string;
  wordTimestamps: readonly WordTimestamp[];
  bgmUrl?: string | null;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({
  voiceUrl,
  wordTimestamps,
  bgmUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const intervals = React.useMemo(
    () => computeSpeechIntervals({ wordTimestamps, pauseThreshold: 0.35 }),
    [wordTimestamps]
  );

  const bgmVolume = React.useMemo(
    () =>
      resolveDuckingVolume({
        currentTime,
        intervals,
        activeSpeechVolume: 0.12,
        pauseVolume: 0.32,
        fadeDuration: 0.15,
      }),
    [currentTime, intervals]
  );

  return (
    <>
      <Html5Audio src={voiceUrl} volume={1} />
      {isNonEmptyString(bgmUrl) ? (
        <Html5Audio loop src={bgmUrl} volume={bgmVolume} />
      ) : null}
    </>
  );
};
