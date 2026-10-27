export interface DurationTargetRange {
  min: number;
  max: number;
}

export interface WordBudget {
  minWords: number;
  maxWords: number;
}

export const CADENCE_WORDS_PER_SEC = 2.4;
export const MIN_CADENCE_WORDS_PER_SEC = 2.3;
export const MAX_CADENCE_WORDS_PER_SEC = 2.5;

const NON_DIGIT_OR_HYPHEN_REGEX = /[^\d-]/gu;

export const parseDurationTarget = (duration: string): DurationTargetRange => {
  const clean = duration.replaceAll(NON_DIGIT_OR_HYPHEN_REGEX, "");
  const [minPart, maxPart] = clean.split("-");

  if (minPart !== undefined && maxPart !== undefined) {
    const min = Math.trunc(Number(minPart));
    const max = Math.trunc(Number(maxPart));

    if (!Number.isNaN(min) && !Number.isNaN(max) && min < max) {
      return { min, max };
    }
  }

  const single = Math.trunc(Number(clean));

  if (!Number.isNaN(single) && single > 0) {
    return { min: Math.max(10, single - 5), max: single + 5 };
  }

  throw new Error(
    `Unsupported video duration target: "${duration}". Expected format like "30-40" or "60-70".`
  );
};

export const calculateWordBudget = (
  minSeconds: number,
  maxSeconds: number
): WordBudget => ({
  minWords: Math.round(minSeconds * MIN_CADENCE_WORDS_PER_SEC),
  maxWords: Math.round(maxSeconds * MAX_CADENCE_WORDS_PER_SEC),
});

export const estimateSpokenDurationSeconds = (wordCount: number): number =>
  Math.round(wordCount / CADENCE_WORDS_PER_SEC);
