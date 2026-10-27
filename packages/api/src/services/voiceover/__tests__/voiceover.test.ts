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
  });

  describe(parseAlignmentToWords, () => {
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
