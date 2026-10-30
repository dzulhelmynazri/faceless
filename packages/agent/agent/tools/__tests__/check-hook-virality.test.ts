import { describe, expect, it } from "vitest";

import {
  calculateViralityScore,
  checkHookViralityInputSchema,
  detectCliché,
} from "../check-hook-virality";

describe("detectCliché helper", () => {
  it("identifies known cliché video hook openers", () => {
    expect(
      detectCliché("Did you know that sharks have existed longer than trees?")
    ).toBeTruthy();
    expect(detectCliché("have you ever wondered why we dream?")).toBeTruthy();
    expect(detectCliché("in this video I will show you")).toBeTruthy();
    expect(detectCliché("hey guys welcome back")).toBeTruthy();
    expect(detectCliché("let me tell you a secret")).toBeTruthy();
  });

  it("does not flag direct pattern-interrupt statements as clichés", () => {
    expect(
      detectCliché(
        "Three bodies were found locked in the bank vault, but none had suffocated."
      )
    ).toBeFalsy();
  });
});

describe("calculateViralityScore algorithm", () => {
  it("awards passing score to viral tier hooks with curiosity loop and no cliché", () => {
    const result = calculateViralityScore({
      hasLoop: true,
      isCliché: false,
      viralityTier: "viral",
    });

    expect(result).toStrictEqual({
      critique:
        "Hook immediately grabs dopamine with strong curiosity and retention mechanics.",
      passed: true,
      suggestedImprovements: [],
      viralityScore: 9,
    });
  });

  it("penalizes average tier hooks that lack curiosity gap", () => {
    const result = calculateViralityScore({
      hasLoop: false,
      isCliché: false,
      viralityTier: "average",
    });

    expect(result.viralityScore).toBe(4);
    expect(result.passed).toBeFalsy();
    expect(result.suggestedImprovements).toContain(
      "Introduce a stark contradiction or unresolved question to force viewers to stay."
    );
  });

  it("penalizes viral tier hooks when a cliché opener is detected", () => {
    const result = calculateViralityScore({
      hasLoop: true,
      isCliché: true,
      viralityTier: "viral",
    });

    expect(result.viralityScore).toBe(6);
    expect(result.passed).toBeFalsy();
    expect(result.suggestedImprovements).toContain(
      "Drop the cliché question and start directly with an active, high-stakes statement or shocking fact."
    );
  });

  it("clamps lowest score to 1 for weak clichés lacking curiosity loop", () => {
    const result = calculateViralityScore({
      hasLoop: false,
      isCliché: true,
      viralityTier: "weak",
    });

    expect(result.viralityScore).toBe(1);
    expect(result.passed).toBeFalsy();
  });
});

describe("checkHookViralityInputSchema contract", () => {
  it("accepts valid hook with optional niche", () => {
    const valid = checkHookViralityInputSchema.safeParse({
      hook: "A man disappeared from a moving elevator in 1994.",
      niche: "true crime",
    });

    expect(valid.success).toBeTruthy();
  });

  it("rejects hooks that are too short", () => {
    const invalid = checkHookViralityInputSchema.safeParse({
      hook: "hi",
    });

    expect(invalid.success).toBeFalsy();
  });
});
