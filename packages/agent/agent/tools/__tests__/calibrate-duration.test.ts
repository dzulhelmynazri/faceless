import { describe, expect, it } from "vitest";

import {
  calibrateDuration,
  calibrateDurationInputSchema,
} from "../calibrate-duration";

describe("calibrateDuration pacing logic", () => {
  it("validates valid input parameters according to schema", () => {
    const valid = calibrateDurationInputSchema.safeParse({
      narrationText: "In the shadow of ancient Rome, a secret was buried.",
      targetDuration: "30-40s",
    });

    expect(valid.success).toBeTruthy();
  });

  it("rejects empty narration text according to schema", () => {
    const invalid = calibrateDurationInputSchema.safeParse({
      narrationText: "",
      targetDuration: "30-40s",
    });

    expect(invalid.success).toBeFalsy();
  });

  it("approves script when word count falls within target budget", () => {
    const narrationText = Array.from({ length: 80 }, (_, i) => `word${i}`).join(
      " "
    );

    const result = calibrateDuration({
      narrationText,
      targetDuration: "30-40",
    });

    expect(result).toStrictEqual({
      critique:
        "Script duration is perfectly calibrated at ~33s (80 words for 30-40s target).",
      estimatedDurationSeconds: 33,
      pacingRecommendation: "none",
      passed: true,
      suggestedWordAdjustment: 0,
      targetDurationSecondsRange: {
        max: 40,
        min: 30,
      },
      wordCount: 80,
    });
  });

  it("recommends expanding script when word count is below budget", () => {
    const narrationText = Array.from({ length: 50 }, (_, i) => `word${i}`).join(
      " "
    );

    const result = calibrateDuration({
      narrationText,
      targetDuration: "30-40",
    });

    expect(result).toStrictEqual({
      critique:
        "Script is too short (~21s, 50 words). Expand narration by approximately 19 words to fill 30-40s.",
      estimatedDurationSeconds: 21,
      pacingRecommendation: "expand",
      passed: false,
      suggestedWordAdjustment: 19,
      targetDurationSecondsRange: {
        max: 40,
        min: 30,
      },
      wordCount: 50,
    });
  });

  it("recommends trimming script when word count exceeds budget", () => {
    const narrationText = Array.from(
      { length: 115 },
      (_, i) => `word${i}`
    ).join(" ");

    const result = calibrateDuration({
      narrationText,
      targetDuration: "30-40",
    });

    expect(result).toStrictEqual({
      critique:
        "Script is too long (~48s, 115 words). Trim approximately 15 words to fit 30-40s.",
      estimatedDurationSeconds: 48,
      pacingRecommendation: "trim",
      passed: false,
      suggestedWordAdjustment: 15,
      targetDurationSecondsRange: {
        max: 40,
        min: 30,
      },
      wordCount: 115,
    });
  });

  it("normalizes irregular whitespace and newlines when counting words", () => {
    const narrationText = "   word1 \n\n\t  word2    word3\nword4   ";

    const result = calibrateDuration({
      narrationText,
      targetDuration: "10-20",
    });

    expect(result.wordCount).toBe(4);
  });
});
