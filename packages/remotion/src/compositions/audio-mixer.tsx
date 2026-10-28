import type { WordTimestamp } from "@faceless/contracts/series";
import { isNonEmptyString } from "@faceless/utils";
import * as React from "react";
import { Html5Audio, useCurrentFrame, useVideoConfig } from "remotion";

import {
  computeSpeechIntervals,
  getDuckingVolume,
} from "../core/speech-envelope";

export interface AudioMixerProps {
  voiceUrl: string;
  wordTimestamps: readonly WordTimestamp[];
  bgmUrl: string | null;
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
    () => computeSpeechIntervals(wordTimestamps),
    [wordTimestamps]
  );

  const bgmVolume = React.useMemo(() => {
    if (!isNonEmptyString(bgmUrl)) {
      return 0;
    }

    return getDuckingVolume(currentTime, intervals);
  }, [bgmUrl, currentTime, intervals]);

  return (
    <>
      <Html5Audio src={voiceUrl} volume={1} />
      {isNonEmptyString(bgmUrl) && (
        <Html5Audio loop src={bgmUrl} volume={bgmVolume} />
      )}
    </>
  );
};
