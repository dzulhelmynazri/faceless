import type { WordTimestamp } from "@faceless/contracts/series";
import {
  captionStyleIdSchema,
  wordTimestampSchema,
} from "@faceless/contracts/series";
import { z } from "zod";

export const videoSceneItemSchema = z.object({
  duration: z.number(),
  id: z.string(),
  imageUrl: z.string(),
  narrationText: z.string(),
  sceneNumber: z.number().int(),
  visualPrompt: z.string(),
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
  bgmUrl: z.string().nullable(),
  glitchEffect: z.boolean(),
});

export type VideoCompositionProps = z.infer<typeof videoCompositionPropsSchema>;
