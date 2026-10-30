import { describe, expect, it } from "vitest";

import { defaultVideoProps } from "../default-props";

const isHttps = (url: string): boolean => url.startsWith("https://");

describe("defaultVideoProps composition invariants", () => {
  it("has scene durations that sum exactly to total audio duration", () => {
    const totalSceneDuration = defaultVideoProps.scenes.reduce(
      (accum, scene) => accum + scene.duration,
      0
    );

    expect(totalSceneDuration).toBe(defaultVideoProps.audioDuration);
  });

  it("has sequentially numbered scenes starting from index 1", () => {
    const sceneNumbers = defaultVideoProps.scenes.map((s) => s.sceneNumber);

    expect(sceneNumbers).toStrictEqual([1, 2, 3]);
  });

  it("maintains strictly positive and chronological word timestamp intervals", () => {
    const areValidIntervals = defaultVideoProps.wordTimestamps.every(
      (word) =>
        word.end > word.start &&
        word.start >= 0 &&
        word.end <= defaultVideoProps.audioDuration
    );

    const isMonotonic = defaultVideoProps.wordTimestamps.every(
      (word, i, arr) => {
        const prev = arr[i - 1];

        return prev === undefined || word.start >= prev.start;
      }
    );

    expect(areValidIntervals).toBeTruthy();
    expect(isMonotonic).toBeTruthy();
  });

  it("provides valid HTTPS audio and scene asset URLs", () => {
    expect(isHttps(defaultVideoProps.voiceUrl)).toBeTruthy();
    expect(isHttps(defaultVideoProps.bgmUrl)).toBeTruthy();
    expect(
      defaultVideoProps.scenes.every((s) => isHttps(s.imageUrl))
    ).toBeTruthy();
  });
});
