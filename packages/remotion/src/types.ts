import type { WordTimestamp } from "@faceless/contracts/series";
import { wordTimestampSchema } from "@faceless/contracts/series";
import { z } from "zod";

export const captionStyleIdSchema = z.enum([
  "bold-stroke",
  "red-highlight",
  "sleek",
  "karaoke",
  "majestic",
  "beast",
  "elegant",
  "pixel",
  "clarity",
]);

export type CaptionStyleId = z.infer<typeof captionStyleIdSchema>;

export const videoSceneItemSchema = z.object({
  id: z.string().optional(),
  sceneNumber: z.number().int(),
  narrationText: z.string(),
  visualPrompt: z.string(),
  imageUrl: z.string(),
  duration: z.number(),
});

export type VideoSceneItem = z.infer<typeof videoSceneItemSchema>;

export interface SpeechInterval {
  start: number;
  end: number;
}

export interface CaptionPhrase {
  words: readonly WordTimestamp[];
  start: number;
  end: number;
  activeWordIndex: number;
}

export const videoCompositionPropsSchema = z.object({
  voiceUrl: z.string(),
  audioDuration: z.number().nonnegative(),
  wordTimestamps: z.array(wordTimestampSchema),
  scenes: z.array(videoSceneItemSchema),
  captionStyleId: captionStyleIdSchema,
  bgmUrl: z.string().nullable().optional(),
  glitchEffect: z.boolean().optional(),
});

export type VideoCompositionProps = z.infer<typeof videoCompositionPropsSchema>;
