import { createGatewayProvider } from "@ai-sdk/gateway";
import { generatedScriptPayloadSchema } from "@faceless/contracts/series";
import type { GeneratedScriptPayload } from "@faceless/contracts/series";
import { isNonEmptyString } from "@faceless/utils";
import { generateText, Output } from "ai";
import dedent from "dedent";

import { calculateWordBudget, parseDurationTarget } from "../agent/lib/pacing";
import { ENV } from "./env";

export { ENV } from "./env";

export type { GeneratedScriptPayload } from "@faceless/contracts/series";

export interface ScriptwriterInput {
  userId: string;
  seriesId: string;
  nichePrompt: string;
  exampleScript: string | null;
  language: string;
  duration: string;
  artStyleId: string;
  topicOverride?: string;
  previousTitles: string[];
}

export const runScriptwriterAgent = async (
  input: ScriptwriterInput
): Promise<GeneratedScriptPayload> => {
  const durationRange = parseDurationTarget(input.duration);

  const { minWords, maxWords } = calculateWordBudget(
    durationRange.min,
    durationRange.max
  );

  const systemPrompt = dedent`
    You are the Lead Scriptwriter and Retention Director for viral short-form faceless videos (TikTok, YouTube Shorts, Instagram Reels).
    Your mission is to generate an extraordinarily engaging, high-retention video script tailored to the user's niche and art style.

    CRITICAL RULES:
    1. HOOK: Never start with clichés like "Did you know", "Have you ever wondered", or "In this video" unless specifically instructed by the niche prompt. Drop the audience straight into an escalating high-stakes scenario, bizarre contradiction, or irresistible curiosity loop in the very first sentence.
    2. DURATION & PACING: The narration MUST be calibrated to 2.3 - 2.5 words per second.
       Target Duration: ${durationRange.min} to ${durationRange.max} seconds.
       Total Narration Word Count Budget: EXACTLY between ${minWords} and ${maxWords} words.
    3. SCENES: Deconstruct the script into 3 to 6 distinct visual scenes.
       Each scene must contain:
       - sceneNumber (1-indexed integer)
       - narrationChunk (the exact spoken line for this visual)
       - visualPrompt (rich, prompt-engineered description for AI image generation in 9:16 vertical ratio, specifying camera angle, lighting, atmosphere, and coherent aesthetics matching artStyleId: "${input.artStyleId}")
       - estimatedSeconds (duration of this visual, between 4 and 8 seconds)
    4. LANGUAGE: Generate the narration and title in the requested language: "${input.language}".
    5. NO REPEATS: Do not duplicate or closely mirror any of these previous episode titles: ${input.previousTitles.length > 0 ? JSON.stringify(input.previousTitles) : "None"}.
  `;

  const exampleBlock = isNonEmptyString(input.exampleScript)
    ? `Example Reference Script:\n${input.exampleScript}\n`
    : "";

  const topicBlock = isNonEmptyString(input.topicOverride)
    ? `Specific Topic Override: ${input.topicOverride}\n`
    : "";

  const userPrompt = dedent`
    Series Niche Prompt: ${input.nichePrompt}
    ${exampleBlock}${topicBlock}Art Style ID: ${input.artStyleId}
    Target Duration: ${input.duration}

    Generate a viral, high-retention episode script adhering strictly to the schema.
  `;

  const gateway = createGatewayProvider({ apiKey: ENV.AI_GATEWAY_API_KEY });
  const model = gateway.languageModel("openai/gpt-4o");

  const result = await generateText({
    model,
    output: Output.object({ schema: generatedScriptPayloadSchema }),
    instructions: systemPrompt,
    prompt: userPrompt,
    temperature: 0.7,
    providerOptions: {
      gateway: {
        user: input.userId,
        quotaEntityId: input.userId,
        tags: [`series:${input.seriesId}`, `user:${input.userId}`],
      },
    },
  });

  return result.output;
};
