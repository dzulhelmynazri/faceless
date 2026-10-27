import type { WordTimestamp } from "@faceless/contracts/series";

import type { SpeechInterval } from "../types";

export interface ResolveDuckingVolumeInput {
  currentTime: number;
  intervals: readonly SpeechInterval[];
  activeSpeechVolume?: number;
  pauseVolume?: number;
  fadeDuration?: number;
}

export interface ComputeSpeechIntervalsInput {
  wordTimestamps: readonly WordTimestamp[];
  pauseThreshold?: number;
}

export const computeSpeechIntervals = ({
  wordTimestamps,
  pauseThreshold = 0.35,
}: ComputeSpeechIntervalsInput): SpeechInterval[] => {
  if (wordTimestamps.length === 0) {
    return [];
  }

  const [firstWord, ...restWords] = wordTimestamps;

  if (!firstWord) {
    return [];
  }

  const intervals: SpeechInterval[] = [];
  let currentStart = firstWord.start;
  let currentEnd = firstWord.end;

  for (const word of restWords) {
    if (word.start - currentEnd < pauseThreshold) {
      currentEnd = Math.max(currentEnd, word.end);
    } else {
      intervals.push({ start: currentStart, end: currentEnd });
      currentStart = word.start;
      currentEnd = word.end;
    }
  }

  intervals.push({ start: currentStart, end: currentEnd });

  return intervals;
};

export const resolveDuckingVolume = ({
  currentTime,
  intervals,
  activeSpeechVolume = 0.12,
  pauseVolume = 0.32,
  fadeDuration = 0.15,
}: ResolveDuckingVolumeInput): number => {
  if (intervals.length === 0) {
    return pauseVolume;
  }

  for (const interval of intervals) {
    const paddedStart = interval.start - fadeDuration;
    const paddedEnd = interval.end + fadeDuration;

    if (currentTime >= paddedStart && currentTime <= paddedEnd) {
      if (currentTime < interval.start) {
        const factor = (currentTime - paddedStart) / fadeDuration;

        return Number(
          (pauseVolume - factor * (pauseVolume - activeSpeechVolume)).toFixed(3)
        );
      }

      if (currentTime > interval.end) {
        const factor = (currentTime - interval.end) / fadeDuration;

        return Number(
          (
            activeSpeechVolume +
            factor * (pauseVolume - activeSpeechVolume)
          ).toFixed(3)
        );
      }

      return activeSpeechVolume;
    }
  }

  return pauseVolume;
};
