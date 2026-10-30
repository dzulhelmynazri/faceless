import { describe, expect, it } from "vitest";

import { parseAlignmentToWords } from "../alignment";
import type { RawElevenLabsAlignment } from "../alignment";
import { sanitizeNarration } from "../sanitizer";

describe("Voiceover Module", () => {
  describe(sanitizeNarration, () => {
    it("strips bracketed and parenthetical stage directions", () => {
      const input =
        "[Dramatic pause] Deep inside the tomb... (whispering) something stirred.";

      const result = sanitizeNarration(input);

      expect(result).toBe("Deep inside the tomb... something stirred.");
    });

    it("strips markdown headers, bold, italics, and backticks", () => {
      const input =
        "# The Mystery\nThis is **shocking**, and *nobody* understood `why`.";

      const result = sanitizeNarration(input);

      expect(result).toBe(
        "The Mystery This is shocking, and nobody understood why."
      );
    });

    it("normalizes irregular whitespace and newlines", () => {
      const input = "  Word one \n\n\t  word two   ";
      const result = sanitizeNarration(input);

      expect(result).toBe("Word one word two");
    });

    it("strips strikethrough and blockquote markdown markers", () => {
      const input = "> ~Outdated theory~ New discovery.";
      const result = sanitizeNarration(input);

      expect(result).toBe("Outdated theory New discovery.");
    });
  });

  describe(parseAlignmentToWords, () => {
    it("returns empty array and zero duration for empty character alignment", () => {
      const alignment: RawElevenLabsAlignment = {
        character_end_times_seconds: [],
        character_start_times_seconds: [],
        characters: [],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toHaveLength(0);
      expect(audioDuration).toBe(0);
    });

    it("handles multiple consecutive whitespace and newline separators", () => {
      const alignment: RawElevenLabsAlignment = {
        character_end_times_seconds: [
          0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
        ],
        character_start_times_seconds: [
          0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8,
        ],
        characters: ["A", " ", " ", " ", "\n", "\n", " ", " ", "B"],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toStrictEqual([
        { cleanWord: "A", end: 0.1, start: 0, word: "A" },
        { cleanWord: "B", end: 0.9, start: 0.8, word: "B" },
      ]);
      expect(audioDuration).toBe(0.9);
    });

    it("strips outer punctuation while keeping internal hyphens and clean word", () => {
      const alignment: RawElevenLabsAlignment = {
        character_end_times_seconds: [
          0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4,
        ],
        character_start_times_seconds: [
          0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3,
        ],
        characters: [
          '"',
          "h",
          "e",
          "l",
          "l",
          "o",
          "-",
          "w",
          "o",
          "r",
          "l",
          "d",
          "!",
          '"',
        ],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toStrictEqual([
        {
          cleanWord: "hello-world",
          end: 1.4,
          start: 0,
          word: '"hello-world!"',
        },
      ]);
      expect(audioDuration).toBe(1.4);
    });

    it("falls back to trimmed token when word is composed entirely of punctuation", () => {
      const alignment: RawElevenLabsAlignment = {
        character_end_times_seconds: [0.2, 0.3, 0.4],
        character_start_times_seconds: [0.1, 0.2, 0.3],
        characters: [".", ".", "."],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toStrictEqual([
        { cleanWord: "...", end: 0.4, start: 0.1, word: "..." },
      ]);
      expect(audioDuration).toBe(0.4);
    });

    it("groups character-level timing into dual-token word timestamps", () => {
      // "nine hikers,"
      // characters: ['n','i','n','e',' ','h','i','k','e','r','s',',']
      const alignment: RawElevenLabsAlignment = {
        characters: [
          "n",
          "i",
          "n",
          "e",
          " ",
          "h",
          "i",
          "k",
          "e",
          "r",
          "s",
          ",",
        ],
        character_start_times_seconds: [
          0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55,
        ],
        character_end_times_seconds: [
          0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
        ],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toHaveLength(2);
      expect(words[0]).toStrictEqual({
        word: "nine",
        cleanWord: "nine",
        start: 0,
        end: 0.2,
      });

      expect(words[1]).toStrictEqual({
        word: "hikers,",
        cleanWord: "hikers",
        start: 0.25,
        end: 0.6,
      });

      expect(audioDuration).toBe(0.6);
    });

    it("preserves apostrophe contractions in cleanWord", () => {
      // "didn't"
      const alignment: RawElevenLabsAlignment = {
        characters: ["d", "i", "d", "n", "'", "t"],
        character_start_times_seconds: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
        character_end_times_seconds: [0.15, 0.2, 0.25, 0.3, 0.35, 0.4],
      };

      const { words, audioDuration } = parseAlignmentToWords(alignment);

      expect(words).toHaveLength(1);
      expect(words[0]?.word).toBe("didn't");
      expect(words[0]?.cleanWord).toBe("didn't");
      expect(audioDuration).toBe(0.4);
    });
  });
});
