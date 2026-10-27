import type { WordTimestamp } from "@faceless/contracts/series";

export interface RawElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface ParsedAudioAlignment {
  words: WordTimestamp[];
  audioDuration: number;
}

const PUNCTUATION_CLEAN_REGEX = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

export const parseAlignmentToWords = (
  alignment: RawElevenLabsAlignment
): ParsedAudioAlignment => {
  const words: WordTimestamp[] = [];
  let currentWord = "";
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < alignment.characters.length; i += 1) {
    const char = alignment.characters[i];
    const start = alignment.character_start_times_seconds[i] ?? 0;
    const end = alignment.character_end_times_seconds[i] ?? start;

    if (char === " " || char === "\n") {
      if (currentWord.trim().length > 0) {
        const trimmed = currentWord.trim();
        const clean = trimmed.replaceAll(PUNCTUATION_CLEAN_REGEX, "");

        words.push({
          word: trimmed,
          cleanWord: clean.length > 0 ? clean : trimmed,
          start: wordStart,
          end: wordEnd,
        });
        currentWord = "";
      }
    } else {
      if (currentWord.length === 0) {
        wordStart = start;
      }

      currentWord += char;
      wordEnd = end;
    }
  }

  if (currentWord.trim().length > 0) {
    const trimmed = currentWord.trim();
    const clean = trimmed.replaceAll(PUNCTUATION_CLEAN_REGEX, "");

    words.push({
      word: trimmed,
      cleanWord: clean.length > 0 ? clean : trimmed,
      start: wordStart,
      end: wordEnd,
    });
  }

  const lastEnd =
    alignment.character_end_times_seconds.length > 0
      ? alignment.character_end_times_seconds.at(-1)
      : 0;

  const audioDuration = lastEnd ?? 0;

  return { words, audioDuration };
};
