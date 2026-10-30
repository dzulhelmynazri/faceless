import { describe, expect, it } from "vitest";

import {
  buildCombinedContent,
  checkContentSafetyInputSchema,
  classifyContentSafetyRisk,
  detectZeroTolerancePhrases,
} from "../check-content-safety";

describe("buildCombinedContent helper", () => {
  it("formats narration text alone when visual prompts are omitted", () => {
    const content = buildCombinedContent("This is the spoken voiceover.");

    expect(content).toBe("Narration: This is the spoken voiceover.");
  });

  it("joins narration text with visual prompts delimited by pipes", () => {
    const content = buildCombinedContent("Historical explanation.", [
      "Scene 1 banner",
      "Scene 2 map",
    ]);

    expect(content).toBe(
      "Narration: Historical explanation.\nVisual Prompts: Scene 1 banner | Scene 2 map"
    );
  });
});

describe("detectZeroTolerancePhrases scanner", () => {
  it("detects prohibited phrases case-insensitively", () => {
    const flagged = detectZeroTolerancePhrases(
      "The historical account detailed the Terrorist Attack on the fortress."
    );

    expect(flagged).toContain("terrorist attack");
  });

  it("returns empty list when content adheres to policy", () => {
    const flagged = detectZeroTolerancePhrases(
      "Ancient philosophers contemplated the meaning of friendship and courage."
    );

    expect(flagged).toStrictEqual([]);
  });
});

describe("classifyContentSafetyRisk evaluation", () => {
  it("marks safe content with none risk level and approval critique", () => {
    const result = classifyContentSafetyRisk({
      choice: "safe",
      detectedKeywords: [],
      isSafeBool: true,
    });

    expect(result).toStrictEqual({
      critique: "Content adheres to mainstream short-form platform standards.",
      flaggedCategories: [],
      isSafe: true,
      recommendations: [],
      riskLevel: "none",
    });
  });

  it("classifies educational edgy themes with low risk level", () => {
    const result = classifyContentSafetyRisk({
      choice: "edgy_educational",
      detectedKeywords: [],
      isSafeBool: true,
    });

    expect(result.isSafe).toBeTruthy();
    expect(result.riskLevel).toBe("low");
  });

  it("adds framing recommendation for shadowban risk content", () => {
    const result = classifyContentSafetyRisk({
      choice: "shadowban_risk",
      detectedKeywords: [],
      isSafeBool: true,
    });

    expect(result.isSafe).toBeTruthy();
    expect(result.riskLevel).toBe("medium");
    expect(result.recommendations).toContain(
      "Use documentary framing and avoid sensationalizing violent crime or tragedy."
    );
  });

  it("escalates risk to high and fails check when zero-tolerance keywords are detected", () => {
    const result = classifyContentSafetyRisk({
      choice: "safe",
      detectedKeywords: ["terrorist attack"],
      isSafeBool: true,
    });

    expect(result.isSafe).toBeFalsy();
    expect(result.riskLevel).toBe("high");
    expect(result.recommendations).toContain(
      "Remove or rephrase prohibited terms: terrorist attack"
    );
  });

  it("escalates risk to high when platform classification is prohibited", () => {
    const result = classifyContentSafetyRisk({
      choice: "prohibited",
      detectedKeywords: [],
      isSafeBool: false,
    });

    expect(result.isSafe).toBeFalsy();
    expect(result.riskLevel).toBe("high");
  });
});

describe("checkContentSafetyInputSchema contract", () => {
  it("validates valid narration and visual prompts", () => {
    const valid = checkContentSafetyInputSchema.safeParse({
      narrationText: "The Roman Colosseum was completed in 80 AD.",
      visualPrompts: ["Colosseum at sunset"],
    });

    expect(valid.success).toBeTruthy();
  });

  it("rejects empty narration text", () => {
    const invalid = checkContentSafetyInputSchema.safeParse({
      narrationText: "",
    });

    expect(invalid.success).toBeFalsy();
  });
});
