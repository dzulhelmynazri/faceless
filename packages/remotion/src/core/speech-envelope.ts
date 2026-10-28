import type { WordTimestamp } from "@faceless/contracts/series";

import type { SpeechInterval } from "../types";

const ACTIVE_SPEECH_VOLUME = 0.12;
const PAUSE_VOLUME = 0.32;
const FADE_DURATION = 0.15;
const PAUSE_THRESHOLD = 0.35;

export const computeSpeechIntervals = (
  wordTimestamps: readonly WordTimestamp[]
): SpeechInterval[] => {
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
    if (word.start - currentEnd < PAUSE_THRESHOLD) {
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

export const getDuckingVolume = (
  currentTime: number,
  intervals: readonly SpeechInterval[]
): number => {
  if (intervals.length === 0) {
    return PAUSE_VOLUME;
  }

  for (const interval of intervals) {
    const paddedStart = interval.start - FADE_DURATION;
    const paddedEnd = interval.end + FADE_DURATION;

    if (currentTime >= paddedStart && currentTime <= paddedEnd) {
      if (currentTime < interval.start) {
        const factor = (currentTime - paddedStart) / FADE_DURATION;

        return PAUSE_VOLUME - factor * (PAUSE_VOLUME - ACTIVE_SPEECH_VOLUME);
      }

      if (currentTime > interval.end) {
        const factor = (currentTime - interval.end) / FADE_DURATION;

        return (
          ACTIVE_SPEECH_VOLUME + factor * (PAUSE_VOLUME - ACTIVE_SPEECH_VOLUME)
        );
      }

      return ACTIVE_SPEECH_VOLUME;
    }
  }

  return PAUSE_VOLUME;
};
