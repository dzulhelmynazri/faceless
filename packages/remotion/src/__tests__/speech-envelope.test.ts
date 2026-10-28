import type { WordTimestamp } from "@faceless/contracts/series";
import { describe, expect, it } from "vitest";

import {
  computeSpeechIntervals,
  getDuckingVolume,
} from "../core/speech-envelope";

describe("Speech Envelope & Audio Ducking", () => {
  const sampleWords: WordTimestamp[] = [
    { word: "Nine", cleanWord: "Nine", start: 1, end: 1.4 },
    // Gap 0.1s -> merged
    { word: "hikers", cleanWord: "hikers", start: 1.5, end: 1.9 },
    // Gap 0.1s -> merged
    { word: "entered", cleanWord: "entered", start: 2, end: 2.5 },
    // Gap 1.5s -> pause
    { word: "None", cleanWord: "None", start: 4, end: 4.4 },
    // Gap 0.1s -> merged
    { word: "returned.", cleanWord: "returned", start: 4.5, end: 5 },
  ];

  it("merges adjacent word timestamps within pause threshold into discrete speech intervals", () => {
    const intervals = computeSpeechIntervals(sampleWords);

    expect(intervals).toHaveLength(2);
    expect(intervals[0]).toStrictEqual({ start: 1, end: 2.5 });
    expect(intervals[1]).toStrictEqual({ start: 4, end: 5 });
  });

  it("returns empty intervals when word timestamps are empty", () => {
    expect(computeSpeechIntervals([])).toStrictEqual([]);
  });

  it("ducks volume smoothly during active speech intervals", () => {
    const intervals = computeSpeechIntervals(sampleWords);

    // During pause before speech (t = 0.5s): full pause volume (0.32)
    const volumeAtStart = getDuckingVolume(0.5, intervals);

    expect(volumeAtStart).toBe(0.32);

    // Right in the middle of first speech block (t = 1.8s): ducked volume (0.12)
    const volumeDuringSpeech = getDuckingVolume(1.8, intervals);

    expect(volumeDuringSpeech).toBe(0.12);

    // In between speech blocks (t = 3.2s): full pause volume (0.32)
    const volumeInPause = getDuckingVolume(3.2, intervals);

    expect(volumeInPause).toBe(0.32);

    // In between speech blocks during second sentence (t = 4.6s): ducked volume (0.12)
    const volumeDuringSecondSpeech = getDuckingVolume(4.6, intervals);

    expect(volumeDuringSecondSpeech).toBe(0.12);
  });
});
