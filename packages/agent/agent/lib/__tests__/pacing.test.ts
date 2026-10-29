import { describe, expect, it } from "vitest";

import {
  calculateWordBudget,
  estimateSpokenDurationSeconds,
  parseDurationTarget,
} from "../pacing";

describe("Pacing Module", () => {
  describe(parseDurationTarget, () => {
    it("parses valid hyphenated duration ranges", () => {
      expect(parseDurationTarget("30-40")).toStrictEqual({ min: 30, max: 40 });
      expect(parseDurationTarget("60-70")).toStrictEqual({ min: 60, max: 70 });
    });

    it("parses duration strings containing non-digit characters", () => {
      expect(parseDurationTarget("30 - 45 seconds")).toStrictEqual({
        max: 45,
        min: 30,
      });
      expect(parseDurationTarget("60s-90s")).toStrictEqual({
        min: 60,
        max: 90,
      });
    });

    it("parses single duration target with +-5 second window", () => {
      expect(parseDurationTarget("30")).toStrictEqual({ min: 25, max: 35 });
      expect(parseDurationTarget("60s")).toStrictEqual({ min: 55, max: 65 });
    });

    it("enforces minimum bound of 10s for small single durations", () => {
      expect(parseDurationTarget("12")).toStrictEqual({ min: 10, max: 17 });
      expect(parseDurationTarget("8")).toStrictEqual({ min: 10, max: 13 });
    });

    it("throws an error for inverted range where min >= max", () => {
      expect(() => parseDurationTarget("50-40")).toThrow(
        'Unsupported video duration target: "50-40"'
      );
      expect(() => parseDurationTarget("30-30")).toThrow(
        'Unsupported video duration target: "30-30"'
      );
    });

    it("throws an error for invalid or empty duration strings", () => {
      expect(() => parseDurationTarget("")).toThrow(
        'Unsupported video duration target: ""'
      );
      expect(() => parseDurationTarget("invalid")).toThrow(
        'Unsupported video duration target: "invalid"'
      );
      expect(() => parseDurationTarget("0")).toThrow(
        'Unsupported video duration target: "0"'
      );
    });
  });

  describe(calculateWordBudget, () => {
    it("calculates accurate word budget for standard 30-40s short", () => {
      const budget = calculateWordBudget(30, 40);

      // min: 30 * 2.3 = 69, max: 40 * 2.5 = 100
      expect(budget).toStrictEqual({
        maxWords: 100,
        minWords: 69,
      });
    });

    it("calculates accurate word budget for 60-70s short", () => {
      const budget = calculateWordBudget(60, 70);

      // min: 60 * 2.3 = 138, max: 70 * 2.5 = 175
      expect(budget).toStrictEqual({
        maxWords: 175,
        minWords: 138,
      });
    });
  });

  describe(estimateSpokenDurationSeconds, () => {
    it("estimates speaking duration based on 2.4 words per second cadence", () => {
      // 120 words / 2.4 = 50 seconds
      expect(estimateSpokenDurationSeconds(120)).toBe(50);
      // 72 words / 2.4 = 30 seconds
      expect(estimateSpokenDurationSeconds(72)).toBe(30);
      // 0 words = 0 seconds
      expect(estimateSpokenDurationSeconds(0)).toBe(0);
    });

    it("rounds to nearest whole second", () => {
      // 25 words / 2.4 = 10.416... -> 10
      expect(estimateSpokenDurationSeconds(25)).toBe(10);
      // 28 words / 2.4 = 11.666... -> 12
      expect(estimateSpokenDurationSeconds(28)).toBe(12);
    });
  });
});
