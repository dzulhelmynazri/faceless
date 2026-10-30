import { describe, expect, it } from "vitest";

import {
  captionStyleIdSchema,
  createSeriesInputSchema,
  ELEVENLABS_MODELS,
  ELEVENLABS_PRICING,
  episodeCustomizationSchema,
  generateEpisodeInputSchema,
  generatedScriptPayloadSchema,
  publishEpisodeNowOutputSchema,
  SERIES_LANGUAGES,
  SERIES_PRESETS,
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

describe("generatedScriptPayloadSchema contract", () => {
  const validScript = {
    fullNarration:
      "Deep inside an abandoned research station in Antarctica, scientists made an impossible discovery that was classified for decades.",
    hook: "In 1998, Russian drillers stopped three miles deep because of this sound.",
    reasoning: "High-curiosity historical hook with escalating pacing",
    scenes: [
      {
        estimatedSeconds: 4,
        narrationChunk:
          "Deep inside an abandoned research station in Antarctica,",
        sceneNumber: 1,
        visualPrompt: "Desolate Antarctic snowstorm engulfing a rusted outpost",
      },
      {
        estimatedSeconds: 4,
        narrationChunk: "scientists made an impossible discovery",
        sceneNumber: 2,
        visualPrompt:
          "Subterranean ice cave with mysterious glowing thermal vent",
      },
      {
        estimatedSeconds: 4,
        narrationChunk: "that was classified for decades.",
        sceneNumber: 3,
        visualPrompt: "Declassified red-stamped confidential documents",
      },
    ],
    targetDurationSeconds: 12,
    title: "The Antarctic Anomaly",
    viralityScore: 9,
  };

  it("validates compliant script payload with minimum 3 scenes", () => {
    expect(
      generatedScriptPayloadSchema.safeParse(validScript).success
    ).toBeTruthy();
  });

  it("rejects payload when scenes array has fewer than 3 scenes", () => {
    const invalid = {
      ...validScript,
      scenes: validScript.scenes.slice(0, 2),
    };

    expect(generatedScriptPayloadSchema.safeParse(invalid).success).toBeFalsy();
  });

  it("rejects payload when hook is shorter than 5 characters", () => {
    const invalid = {
      ...validScript,
      hook: "Hey!",
    };

    expect(generatedScriptPayloadSchema.safeParse(invalid).success).toBeFalsy();
  });
});

describe("generateEpisodeInputSchema contract", () => {
  it("validates generateEpisode input with optional topic override", () => {
    const valid = {
      seriesId: "series_test_123",
      topicOverride: "The mysterious Bermuda Triangle disappearance",
    };

    expect(generateEpisodeInputSchema.safeParse(valid).success).toBeTruthy();
  });

  it("rejects generateEpisode input when topic override exceeds 200 characters", () => {
    const invalid = {
      seriesId: "series_test_123",
      topicOverride: "T".repeat(201),
    };

    expect(generateEpisodeInputSchema.safeParse(invalid).success).toBeFalsy();
  });
});
