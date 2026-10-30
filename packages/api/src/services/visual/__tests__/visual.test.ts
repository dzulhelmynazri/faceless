import type { WordTimestamp } from "@faceless/contracts/series";
import { describe, expect, it } from "vitest";

import { calibrateSceneDurations } from "../calibrator";
import { enrichPromptWithStyle } from "../enricher";

describe("Visual Service", () => {
  describe(enrichPromptWithStyle, () => {
    it("enriches prompt with anime style, 9:16 composition, and anti-text tokens", () => {
      const result = enrichPromptWithStyle({
        visualPrompt: "A futuristic cyberpunk highway at midnight",
        artStyleId: "anime",
      });

      expect(result).toContain("A futuristic cyberpunk highway at midnight");
      expect(result).toContain("Makoto Shinkai sky");
      expect(result).toContain("vertical 9:16 portrait aspect ratio");
      expect(result).toContain("no text, no captions, no subtitles");
    });

    it("enriches prompt with comic style modifiers", () => {
      const result = enrichPromptWithStyle({
        visualPrompt: "Superhero looking over a dark city",
        artStyleId: "comic",
      });

      expect(result).toContain("vintage American comic book style");
      expect(result).toContain("halftone dot shading");
    });

    it("enriches prompt with ghibli and pixel-art styles while trimming prompt whitespace", () => {
      const ghibliResult = enrichPromptWithStyle({
        visualPrompt: "  A tranquil cottage in a grassy meadow  ",
        artStyleId: "ghibli",
      });

      const pixelResult = enrichPromptWithStyle({
        visualPrompt: "Cyberpunk alleyway with neon signs",
        artStyleId: "pixel-art",
      });

      expect(
        ghibliResult.startsWith(
          "A tranquil cottage in a grassy meadow, hand-painted Studio Ghibli"
        )
      ).toBeTruthy();
      expect(pixelResult).toContain("retro 16-bit pixel art");
    });

    it("falls back to realism when unknown artStyleId is passed", () => {
      const result = enrichPromptWithStyle({
        visualPrompt: "A lone cabin in the woods",
        artStyleId: "unknown-style-xyz",
      });

      expect(result).toContain("35mm cinematic photograph");
      expect(result).toContain("8k photorealistic");
    });
  });

  describe(calibrateSceneDurations, () => {
    it("returns audioDuration for a single scene", () => {
      const scenes = [
        {
          sceneNumber: 1,
          narrationChunk: "The story began on a quiet rainy afternoon.",
          estimatedSeconds: 5,
        },
      ];

      const calibrated = calibrateSceneDurations({
        scenes,
        wordTimestamps: [],
        audioDuration: 12.5,
      });

      expect(calibrated).toStrictEqual([
        {
          sceneNumber: 1,
          duration: 12.5,
        },
      ]);
    });

    it("calibrates multiple scene durations to word timestamps", () => {
      const scenes = [
        {
          sceneNumber: 1,
          narrationChunk: "Nine hikers entered the mountain.",
          estimatedSeconds: 5,
        },
        {
          sceneNumber: 2,
          narrationChunk: "None of them returned.",
          estimatedSeconds: 5,
        },
      ];

      // 5 words for scene 1, 4 words for scene 2 = 9 words total
      const wordTimestamps: WordTimestamp[] = [
        { word: "Nine", cleanWord: "Nine", start: 0, end: 0.5 },
        { word: "hikers", cleanWord: "hikers", start: 0.5, end: 1 },
        { word: "entered", cleanWord: "entered", start: 1, end: 1.5 },
        { word: "the", cleanWord: "the", start: 1.5, end: 1.8 },
        { word: "mountain.", cleanWord: "mountain", start: 1.8, end: 2.5 },
        { word: "None", cleanWord: "None", start: 2.6, end: 3 },
        { word: "of", cleanWord: "of", start: 3, end: 3.2 },
        { word: "them", cleanWord: "them", start: 3.2, end: 3.6 },
        { word: "returned.", cleanWord: "returned", start: 3.6, end: 4.5 },
      ];

      const calibrated = calibrateSceneDurations({
        scenes,
        wordTimestamps,
        audioDuration: 4.5,
      });

      expect(calibrated).toHaveLength(2);
      expect(calibrated[0]?.sceneNumber).toBe(1);
      expect(calibrated[0]?.duration).toBe(2.5);
      expect(calibrated[1]?.sceneNumber).toBe(2);
      expect(calibrated[1]?.duration).toBe(2);
    });

    it("proportional fallback when word timestamps are empty", () => {
      const scenes = [
        {
          sceneNumber: 1,
          narrationChunk: "Scene one text",
          estimatedSeconds: 4,
        },
        {
          sceneNumber: 2,
          narrationChunk: "Scene two text",
          estimatedSeconds: 6,
        },
      ];

      const calibrated = calibrateSceneDurations({
        scenes,
        wordTimestamps: [],
        audioDuration: 10,
      });

      expect(calibrated).toHaveLength(2);
      expect(calibrated[0]?.duration).toBe(4);
      expect(calibrated[1]?.duration).toBe(6);
    });
  });
});
