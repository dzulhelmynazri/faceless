import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  calculateWordBudget,
  estimateSpokenDurationSeconds,
  parseDurationTarget,
} from "../lib/pacing";

export interface DurationCalibrationResult {
  passed: boolean;
  wordCount: number;
  estimatedDurationSeconds: number;
  targetDurationSecondsRange: {
    min: number;
    max: number;
  };
  pacingRecommendation: "none" | "trim" | "expand";
  suggestedWordAdjustment: number;
  critique: string;
}

const buildCritique = (
  passed: boolean,
  recommendation: "none" | "trim" | "expand",
  estimatedSeconds: number,
  wordCount: number,
  minSeconds: number,
  maxSeconds: number,
  wordAdjustment: number
): string => {
  if (passed) {
    return `Script duration is perfectly calibrated at ~${estimatedSeconds}s (${wordCount} words for ${minSeconds}-${maxSeconds}s target).`;
  }

  if (recommendation === "trim") {
    return `Script is too long (~${estimatedSeconds}s, ${wordCount} words). Trim approximately ${wordAdjustment} words to fit ${minSeconds}-${maxSeconds}s.`;
  }

  return `Script is too short (~${estimatedSeconds}s, ${wordCount} words). Expand narration by approximately ${wordAdjustment} words to fill ${minSeconds}-${maxSeconds}s.`;
};

export default defineTool({
  description:
    "Calibrate short-form video narration word count against human/TTS speaking cadence (2.3-2.5 words/sec) and target video duration.",
  inputSchema: z.object({
    narrationText: z
      .string()
      .min(1)
      .describe("The full voiceover narration text of the script."),
    targetDuration: z
      .string()
      .describe(
        'The target video duration, e.g. "30-40s", "60-70s", "30-50s", or a number of seconds.'
      ),
  }),
  execute({ narrationText, targetDuration }): DurationCalibrationResult {
    const words = narrationText
      .trim()
      .split(/\s+/u)
      .filter((w) => w.length > 0);

    const wordCount = words.length;
    const estimatedSeconds = estimateSpokenDurationSeconds(wordCount);

    const { min: minSeconds, max: maxSeconds } =
      parseDurationTarget(targetDuration);

    const { minWords, maxWords } = calculateWordBudget(minSeconds, maxSeconds);

    let recommendation: "none" | "trim" | "expand" = "none";
    let wordAdjustment = 0;
    let passed = false;

    if (wordCount < minWords) {
      recommendation = "expand";
      wordAdjustment = minWords - wordCount;
      passed = false;
    } else if (wordCount > maxWords) {
      recommendation = "trim";
      wordAdjustment = wordCount - maxWords;
      passed = false;
    } else {
      passed = true;
    }

    const critique = buildCritique(
      passed,
      recommendation,
      estimatedSeconds,
      wordCount,
      minSeconds,
      maxSeconds,
      wordAdjustment
    );

    return {
      passed,
      wordCount,
      estimatedDurationSeconds: estimatedSeconds,
      targetDurationSecondsRange: {
        min: minSeconds,
        max: maxSeconds,
      },
      pacingRecommendation: recommendation,
      suggestedWordAdjustment: wordAdjustment,
      critique,
    };
  },
});
