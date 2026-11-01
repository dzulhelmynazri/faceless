import { isNonEmptyString } from "@faceless/utils";
import { decide } from "eve/ai";
import { defineTool } from "eve/tools";
import { z } from "zod";

export interface ViralityEvaluationResult {
  passed: boolean;
  viralityScore: number;
  hasCuriosityLoop: boolean;
  hasClichéOpener: boolean;
  critique: string;
  suggestedImprovements: string[];
}

export const detectCliché = (hook: string): boolean => {
  const lower = hook.toLowerCase().trim();

  return (
    lower.startsWith("did you know") ||
    lower.startsWith("have you ever wondered") ||
    lower.startsWith("in this video") ||
    lower.startsWith("in today's video") ||
    lower.startsWith("hey guys") ||
    lower.startsWith("let me tell you")
  );
};

export interface CalculateViralityScoreOptions {
  hasLoop: boolean;
  isCliché: boolean;
  viralityTier: "viral" | "average" | "weak";
}

export interface CalculatedViralityScore {
  critique: string;
  passed: boolean;
  suggestedImprovements: string[];
  viralityScore: number;
}

export const calculateViralityScore = ({
  hasLoop,
  isCliché,
  viralityTier,
}: CalculateViralityScoreOptions): CalculatedViralityScore => {
  let baseScore = 6;

  if (viralityTier === "viral") {
    baseScore = 9;
  } else if (viralityTier === "weak") {
    baseScore = 3;
  }

  if (!hasLoop) {
    baseScore -= 2;
  }

  if (isCliché) {
    baseScore -= 3;
  }

  const adjustedScore = Math.max(1, Math.min(10, Math.round(baseScore)));
  const passed = adjustedScore >= 8 && !isCliché && hasLoop;

  const suggestions: string[] = [];

  if (isCliché) {
    suggestions.push(
      "Drop the cliché question and start directly with an active, high-stakes statement or shocking fact."
    );
  }

  if (!hasLoop) {
    suggestions.push(
      "Introduce a stark contradiction or unresolved question to force viewers to stay."
    );
  }

  return {
    critique: passed
      ? "Hook immediately grabs dopamine with strong curiosity and retention mechanics."
      : "Hook lacks urgency, curiosity gap, or relies on overly familiar tropes. Needs stronger pattern interrupt.",
    passed,
    suggestedImprovements: suggestions,
    viralityScore: adjustedScore,
  };
};

export const checkHookViralityInputSchema = z.object({
  hook: z
    .string()
    .min(3)
    .describe("The opening 1-2 sentences of the video script."),
  niche: z
    .string()
    .optional()
    .describe(
      "The genre or niche of the video (e.g. true crime, stoic motivation, history)."
    ),
});

export default defineTool({
  description:
    "Evaluate the viral hook quality, retention probability, and curiosity loop of the opening lines of a short-form video script.",
  inputSchema: checkHookViralityInputSchema,
  async execute({ hook, niche }, ctx): Promise<ViralityEvaluationResult> {
    const isCliché = detectCliché(hook);

    const state: Record<string, string> = isNonEmptyString(niche)
      ? { hook, niche }
      : { hook };

    const decision = await decide({
      questions: {
        hasCuriosityLoop: {
          instructions:
            "Does this hook establish an immediate, compelling curiosity gap that cannot be satisfied without watching the full video?",
          type: "boolean",
        },
        viralityTier: {
          criteria: {
            average:
              "Decent opening but predictable or mild tension (score 5-7)",
            viral:
              "Irresistible, intense pattern interrupt, must-watch curiosity loop (score 8-10)",
            weak: "Boring, predictable, cliché opener, or instantly skipped (score 1-4)",
          },
          instructions:
            "Rate the viral retention potential of this opening hook.",
          type: "choice",
        },
      },
      signal: ctx.abortSignal,
      state,
    });

    const viralityTierAnswer = decision.answers.viralityTier;

    if (viralityTierAnswer === undefined || !("choice" in viralityTierAnswer)) {
      throw new Error("Failed to evaluate hook virality tier.");
    }

    const viralityTier = viralityTierAnswer.choice;

    const curiosityLoopAnswer = decision.answers.hasCuriosityLoop;

    if (
      curiosityLoopAnswer === undefined ||
      !("probability" in curiosityLoopAnswer)
    ) {
      throw new Error("Failed to evaluate hook curiosity loop.");
    }

    const hasLoop = curiosityLoopAnswer.probability >= 0.5;

    const scoreResult = calculateViralityScore({
      hasLoop,
      isCliché,
      viralityTier,
    });

    return {
      passed: scoreResult.passed,
      viralityScore: scoreResult.viralityScore,
      hasCuriosityLoop: hasLoop,
      hasClichéOpener: isCliché,
      critique: scoreResult.critique,
      suggestedImprovements: scoreResult.suggestedImprovements,
    };
  },
});
