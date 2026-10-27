import type { WordTimestamp } from "@faceless/contracts/series";
import { describe, expect, it } from "vitest";

import {
  buildCaptionPhrases,
  getCaptionPhraseAtTime,
} from "../core/caption-window";

describe("Caption Window & Punctuation Chunking", () => {
  const sampleWords: WordTimestamp[] = [
    { word: "Nine", cleanWord: "Nine", start: 0.2, end: 0.5 },
    { word: "hikers", cleanWord: "hikers", start: 0.5, end: 0.9 },
    // Comma break
    { word: "entered,", cleanWord: "entered", start: 0.9, end: 1.4 },
    { word: "none", cleanWord: "none", start: 1.6, end: 2 },
    // Period break
    { word: "returned.", cleanWord: "returned", start: 2, end: 2.5 },
  ];

  it("splits phrases at punctuation boundaries into distinct phrase items", () => {
    const phrases = buildCaptionPhrases({
      wordTimestamps: sampleWords,
      maxWordsPerPhrase: 3,
    });

    expect(phrases).toHaveLength(2);
    expect(phrases[0]?.words.map((w) => w.cleanWord)).toStrictEqual([
      "Nine",
      "hikers",
      "entered",
    ]);
    expect(phrases[1]?.words.map((w) => w.cleanWord)).toStrictEqual([
      "none",
      "returned",
    ]);
  });

  it("preserves start and end timestamps for punctuation-bounded phrases", () => {
    const phrases = buildCaptionPhrases({
      wordTimestamps: sampleWords,
      maxWordsPerPhrase: 3,
    });

    expect(phrases[0]?.start).toBe(0.2);
    expect(phrases[0]?.end).toBe(1.4);
    expect(phrases[1]?.start).toBe(1.6);
    expect(phrases[1]?.end).toBe(2.5);
  });

  it("limits phrases to maxWordsPerPhrase when no punctuation occurs", () => {
    const words: WordTimestamp[] = [
      { word: "one", cleanWord: "one", start: 0.1, end: 0.3 },
      { word: "two", cleanWord: "two", start: 0.3, end: 0.5 },
      { word: "three", cleanWord: "three", start: 0.5, end: 0.7 },
      { word: "four", cleanWord: "four", start: 0.7, end: 0.9 },
      { word: "five", cleanWord: "five", start: 0.9, end: 1.1 },
    ];

    const phrases = buildCaptionPhrases({
      wordTimestamps: words,
      maxWordsPerPhrase: 3,
    });

    expect(phrases).toHaveLength(2);
    expect(phrases[0]?.words).toHaveLength(3);
    expect(phrases[1]?.words).toHaveLength(2);
  });

  it("returns null when timestamp is before speech begins", () => {
    const phrases = buildCaptionPhrases({
      wordTimestamps: sampleWords,
      maxWordsPerPhrase: 3,
    });

    expect(getCaptionPhraseAtTime({ phrases, currentTime: 0.05 })).toBeNull();
  });

  it("identifies the active phrase and active word index at given timestamps", () => {
    const phrases = buildCaptionPhrases({
      wordTimestamps: sampleWords,
      maxWordsPerPhrase: 3,
    });

    const match1 = getCaptionPhraseAtTime({ phrases, currentTime: 0.3 });
    const match2 = getCaptionPhraseAtTime({ phrases, currentTime: 0.7 });
    const match3 = getCaptionPhraseAtTime({ phrases, currentTime: 2.2 });

    expect(match1?.activeWordIndex).toBe(0);
    expect(match2?.activeWordIndex).toBe(1);
    expect(match3?.activeWordIndex).toBe(1);
  });
});
