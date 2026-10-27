const STAGE_DIRECTIONS_REGEX = /\[.*?\]|\(.*?\)/gu;
const MARKDOWN_CHARS_REGEX = /[#*_~`>]/gu;
const MULTIPLE_WHITESPACE_REGEX = /\s+/gu;

export const sanitizeNarration = (rawText: string): string =>
  rawText
    .replaceAll(STAGE_DIRECTIONS_REGEX, "")
    .replaceAll(MARKDOWN_CHARS_REGEX, "")
    .replaceAll(MULTIPLE_WHITESPACE_REGEX, " ")
    .trim();
