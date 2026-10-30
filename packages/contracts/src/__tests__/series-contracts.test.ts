import { describe, expect, it } from "vitest";

import {
  captionStyleIdSchema,
  createSeriesInputSchema,
  ELEVENLABS_MODELS,
  ELEVENLABS_PRICING,
  episodeCustomizationSchema,
  publishEpisodeNowOutputSchema,
  SERIES_LANGUAGES,
  SERIES_PRESETS,
  updateEpisodeSceneInputSchema,
  wordTimestampSchema,
} from "../series";

describe("createSeriesInputSchema contract", () => {
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

describe("captionStyleIdSchema contract", () => {
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

    const allValid = validStyles.every(
      (style) => captionStyleIdSchema.safeParse(style).success
    );

    expect(allValid).toBeTruthy();
  });

  it("rejects unknown caption styles", () => {
    expect(captionStyleIdSchema.safeParse("comic-sans").success).toBeFalsy();
  });
});

describe("wordTimestampSchema contract", () => {
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

describe("episodeCustomizationSchema contract", () => {
  it("validates customization with nullable bgmUrl and glitch toggle", () => {
    const valid = {
      bgmUrl: null,
      captionStyleId: "karaoke",
      glitchEffect: false,
    };

    expect(episodeCustomizationSchema.safeParse(valid).success).toBeTruthy();
  });
});

describe("SERIES_PRESETS constant definitions", () => {
  it("ensures all presets have unique IDs and non-empty prompt content", () => {
    const presetIds = SERIES_PRESETS.map((preset) => preset.id);
    const uniqueIds = new Set(presetIds);

    const allHaveContent = SERIES_PRESETS.every(
      (preset) =>
        preset.title.length > 0 &&
        preset.description.length > 0 &&
        preset.nichePrompt.length > 0 &&
        preset.exampleScript.length > 0
    );

    expect(uniqueIds.size).toBe(SERIES_PRESETS.length);
    expect(allHaveContent).toBeTruthy();
  });
});

describe("SERIES_LANGUAGES constant definitions", () => {
  it("ensures all supported languages have unique codes and non-empty labels", () => {
    const languageCodes = SERIES_LANGUAGES.map((lang) => lang.code);
    const uniqueCodes = new Set(languageCodes);

    const allHaveMetadata = SERIES_LANGUAGES.every(
      (lang) => lang.flag.length > 0 && lang.label.length > 0
    );

    expect(uniqueCodes.size).toBe(SERIES_LANGUAGES.length);
    expect(allHaveMetadata).toBeTruthy();
  });
});

describe("ELEVENLABS_PRICING configuration", () => {
  it("defines positive rates for all supported ElevenLabs models", () => {
    const allModelsPriced = ELEVENLABS_MODELS.every((model) => {
      const pricing = ELEVENLABS_PRICING[model];

      return pricing.pricePer1kChars > 0 && pricing.pricePerChar > 0;
    });

    expect(allModelsPriced).toBeTruthy();
  });
});

describe("updateEpisodeSceneInputSchema contract", () => {
  it("validates positive sceneNumber", () => {
    const valid = {
      episodeId: "ep_123",
      narrationText: "Updated script line",
      sceneNumber: 1,
      visualPrompt: "Updated visual prompt",
    };

    expect(updateEpisodeSceneInputSchema.safeParse(valid).success).toBeTruthy();
  });

  it("rejects non-positive sceneNumber or empty episodeId", () => {
    const nonPositiveScene = {
      episodeId: "ep_123",
      sceneNumber: 0,
    };

    const emptyEpisodeId = {
      episodeId: "",
      sceneNumber: 1,
    };

    expect(
      updateEpisodeSceneInputSchema.safeParse(nonPositiveScene).success
    ).toBeFalsy();
    expect(
      updateEpisodeSceneInputSchema.safeParse(emptyEpisodeId).success
    ).toBeFalsy();
  });
});

describe("publishEpisodeNowOutputSchema contract", () => {
  it("validates successful publication payload with platform outcomes", () => {
    const valid = {
      outcomes: [
        {
          accountId: "acc_tiktok_1",
          platform: "tiktok",
          postId: "post_123",
          state: "published",
        },
      ],
      publishedAt: "2026-10-30T10:00:00.000Z",
      status: "PUBLISHED" as const,
      success: true,
    };

    expect(publishEpisodeNowOutputSchema.safeParse(valid).success).toBeTruthy();
  });

  it("rejects payload with invalid episode status value", () => {
    const invalid = {
      outcomes: [],
      publishedAt: null,
      status: "INVALID_STATUS",
      success: false,
    };

    expect(
      publishEpisodeNowOutputSchema.safeParse(invalid).success
    ).toBeFalsy();
  });
});
