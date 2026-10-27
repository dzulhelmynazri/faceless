import { decide } from "eve/ai";
import { defineTool } from "eve/tools";
import { z } from "zod";

export interface ContentSafetyEvaluationResult {
  isSafe: boolean;
  flaggedCategories: string[];
  riskLevel: "none" | "low" | "medium" | "high";
  critique: string;
  recommendations: string[];
}

const ZERO_TOLERANCE_PHRASES = [
  "kill yourself",
  "commit suicide",
  "child sexual",
  "child abuse",
  "child pornography",
  "terrorist attack",
  "holocaust denial",
  "mutilat",
] as const;

export default defineTool({
  description:
    "Check script narration and visual prompts for short-form video platform policy compliance (TikTok, YouTube Shorts, Meta Reels) to prevent shadowbans or demonetization.",
  inputSchema: z.object({
    narrationText: z
      .string()
      .min(1)
      .describe("The voiceover script narration."),
    visualPrompts: z
      .array(z.string())
      .optional()
      .describe("Visual generation prompts for scenes."),
  }),
  async execute(
    { narrationText, visualPrompts },
    ctx
  ): Promise<ContentSafetyEvaluationResult> {
    const parts = [`Narration: ${narrationText}`];

    if (visualPrompts !== undefined && visualPrompts.length > 0) {
      parts.push(`Visual Prompts: ${visualPrompts.join(" | ")}`);
    }

    const combinedContent = parts.join("\n");

    const detectedKeywords = ZERO_TOLERANCE_PHRASES.filter((kw) =>
      combinedContent.toLowerCase().includes(kw)
    );

    const decision = await decide({
      state: { content: combinedContent },
      questions: {
        isSafeForSocialMedia: {
          type: "boolean",
          instructions:
            "Is this short-form script compliant with TikTok, YouTube Shorts, and Instagram Reels advertiser guidelines (no gratuitous gore, no self-harm incitement, no illegal instructions, no extreme hate speech)?",
        },
        riskClassification: {
          type: "choice",
          instructions:
            "Classify the platform moderation risk level of this content.",
          criteria: {
            safe: "Completely safe for general audience monetization",
            edgy_educational:
              "Dramatic history or crime but strictly educational and permissible",
            shadowban_risk:
              "Borderline content that may reduce algorithmic distribution",
            prohibited:
              "Violates core community guidelines (violence, self-harm, hate speech)",
          },
        },
      },
      abortSignal: ctx.abortSignal,
    });

    const isSafeAnswer = decision.answers.isSafeForSocialMedia;

    if (isSafeAnswer === undefined || !("probability" in isSafeAnswer)) {
      throw new Error("Failed to evaluate content safety compliance.");
    }

    const isSafeBool = isSafeAnswer.probability >= 0.5;

    const riskAnswer = decision.answers.riskClassification;

    if (riskAnswer === undefined || !("choice" in riskAnswer)) {
      throw new Error("Failed to evaluate moderation risk classification.");
    }

    const { choice } = riskAnswer;

    const isSafe =
      isSafeBool && detectedKeywords.length === 0 && choice !== "prohibited";

    let riskLevel: "none" | "low" | "medium" | "high" = "none";

    if (detectedKeywords.length > 0 || choice === "prohibited" || !isSafeBool) {
      riskLevel = "high";
    } else if (choice === "shadowban_risk") {
      riskLevel = "medium";
    } else if (choice === "edgy_educational") {
      riskLevel = "low";
    }

    const recommendations: string[] = [];

    if (detectedKeywords.length > 0) {
      recommendations.push(
        `Remove or rephrase prohibited terms: ${detectedKeywords.join(", ")}`
      );
    }

    if (choice === "shadowban_risk") {
      recommendations.push(
        "Use documentary framing and avoid sensationalizing violent crime or tragedy."
      );
    }

    return {
      isSafe,
      flaggedCategories: detectedKeywords,
      riskLevel,
      critique: isSafe
        ? "Content adheres to mainstream short-form platform standards."
        : "Content contains flagged terms or high-risk themes that may trigger shadowbans.",
      recommendations,
    };
  },
});
