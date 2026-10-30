import { describe, expect, it } from "vitest";

import {
  captionStyleIdSchema,
  createSeriesInputSchema,
  episodeCustomizationSchema,
  wordTimestampSchema,
} from "../series";

describe(createSeriesInputSchema, () => {
  it("validates minimal valid payload and populates schema defaults", () => {
    const minimal = {
      artStyleId: "polaroid",
      captionStyleId: "bold-stroke",
      name: "  Historical Tales  ",
      nichePrompt: "Ancient Rome daily life",
      voiceId: "voice_adam",
    };

    const parsed = createSeriesInputSchema.parse(minimal);

    expect(parsed.name).toBe("Historical Tales");
    expect(parsed.language).toBe("en");
    expect(parsed.glitchEffect).toBeTruthy();
    expect(parsed.publishTime).toBe("12:00 PM");
  });

  it("rejects payload when required identifiers are missing or empty", () => {
    const invalid = {
      artStyleId: "",
      captionStyleId: "bold-stroke",
      name: "",
      nichePrompt: "Ancient Rome",
      voiceId: "",
    };

    const parsed = createSeriesInputSchema.safeParse(invalid);

    expect(parsed.success).toBeFalsy();
  });

  it("rejects name exceeding 100 characters", () => {
    const longName = "A".repeat(101);

    const parsed = createSeriesInputSchema.safeParse({
      artStyleId: "polaroid",
      captionStyleId: "bold-stroke",
      name: longName,
      nichePrompt: "Ancient Rome",
      voiceId: "voice_adam",
    });

    expect(parsed.success).toBeFalsy();
  });
});

describe(captionStyleIdSchema, () => {
  it("accepts known caption style identifiers", () => {
    const validStyles = [
      "bold-stroke",
      "red-highlight",
      "sleek",
      "karaoke",
      "majestic",
      "beast",
      "elegant",
      "pixel",
      "clarity",
    ];

    for (const style of validStyles) {
      expect(captionStyleIdSchema.safeParse(style).success).toBeTruthy();
    }
  });

  it("rejects unknown caption styles", () => {
    expect(captionStyleIdSchema.safeParse("comic-sans").success).toBeFalsy();
  });
});

describe(wordTimestampSchema, () => {
  it("validates clean word and non-negative timestamps", () => {
    const valid = {
      cleanWord: "ancient",
      end: 1.5,
      start: 0.8,
      word: "Ancient,",
    };

    expect(wordTimestampSchema.safeParse(valid).success).toBeTruthy();
  });

  it("rejects negative timestamp values", () => {
    const negative = {
      cleanWord: "ancient",
      end: 1.5,
      start: -0.5,
      word: "Ancient",
    };

    expect(wordTimestampSchema.safeParse(negative).success).toBeFalsy();
  });
});

describe(episodeCustomizationSchema, () => {
  it("validates customization with nullable bgmUrl and glitch toggle", () => {
    const valid = {
      bgmUrl: null,
      captionStyleId: "karaoke",
      glitchEffect: false,
    };

    expect(episodeCustomizationSchema.safeParse(valid).success).toBeTruthy();
  });
});
