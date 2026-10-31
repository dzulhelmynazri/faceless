import type { WordTimestamp } from "@faceless/contracts/series";

import type { CaptionPhrase } from "../types";

export interface BuildCaptionPhrasesInput {
  maxWordsPerPhrase: number;
  wordTimestamps: readonly WordTimestamp[];
}

export interface GetCaptionPhraseAtTimeInput {
  currentTime: number;
  phrases: readonly CaptionPhrase[];
}

const TERMINAL_PUNCTUATION_REGEX = /[.?!,]$/u;
const PAUSE_HOLD_DURATION_SECONDS = 0.25;

export const buildCaptionPhrases = ({
  maxWordsPerPhrase,
  wordTimestamps,
}: BuildCaptionPhrasesInput): CaptionPhrase[] => {
  if (wordTimestamps.length === 0) {
    return [];
  }

  const phrases: CaptionPhrase[] = [];
  let currentWords: WordTimestamp[] = [];

  for (const word of wordTimestamps) {
    currentWords.push(word);

    const hasTerminalPunctuation = TERMINAL_PUNCTUATION_REGEX.test(
      word.word.trim()
    );

    const isAtMaxCapacity = currentWords.length >= maxWordsPerPhrase;

    if (hasTerminalPunctuation || isAtMaxCapacity) {
      const [firstWord] = currentWords;
      const lastWord = currentWords.at(-1);

      if (firstWord && lastWord) {
        phrases.push({
          words: currentWords,
          start: firstWord.start,
          end: lastWord.end,
          activeWordIndex: 0,
        });
      }

      currentWords = [];
    }
  }

  if (currentWords.length > 0) {
    const [firstWord] = currentWords;
    const lastWord = currentWords.at(-1);

    if (firstWord && lastWord) {
      phrases.push({
        words: currentWords,
        start: firstWord.start,
        end: lastWord.end,
        activeWordIndex: 0,
      });
    }
  }

  return phrases;
};

export const getCaptionPhraseAtTime = ({
  currentTime,
  phrases,
}: GetCaptionPhraseAtTimeInput): CaptionPhrase | null => {
  if (phrases.length === 0) {
    return null;
  }

  for (const phrase of phrases) {
    const visibleStart = phrase.start;
    const visibleEnd = phrase.end + PAUSE_HOLD_DURATION_SECONDS;

    if (currentTime >= visibleStart && currentTime <= visibleEnd) {
      let activeIndex = 0;

      for (const [i, word] of phrase.words.entries()) {
        if (currentTime >= word.start) {
          activeIndex = i;
        }
      }

      return {
        words: phrase.words,
        start: phrase.start,
        end: phrase.end,
        activeWordIndex: activeIndex,
      };
    }
  }

  return null;
};
