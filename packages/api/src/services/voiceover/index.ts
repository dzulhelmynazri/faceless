import { ELEVENLABS_PRICING } from "@faceless/contracts/series";
import type { SeriesEpisodeAudioMetadata } from "@faceless/contracts/series";
import type { Files } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import { z } from "zod";

import { parseAlignmentToWords } from "./alignment";
import { sanitizeNarration } from "./sanitizer";

export { parseAlignmentToWords } from "./alignment";

export type { RawElevenLabsAlignment } from "./alignment";

export type { WordTimestamp } from "@faceless/contracts/series";

export { sanitizeNarration } from "./sanitizer";

export interface SynthesizeVoiceoverInput {
  userId: string;
  seriesId: string;
  episodeId: string;
  rawNarration: string;
  voiceId: string;
  storage: Files;
  apiKey?: string;
}

export interface SynthesizeVoiceoverOutput {
  audioUrl: string;
  audioKey: string;
  metadata: SeriesEpisodeAudioMetadata;
}

const elevenLabsApiResponseSchema = z.object({
  audio_base64: z.string().min(1),
  alignment: z.object({
    characters: z.array(z.string()),
    character_start_times_seconds: z.array(z.number()),
    character_end_times_seconds: z.array(z.number()),
  }),
});

export const synthesizeVoiceover = async (
  input: SynthesizeVoiceoverInput
): Promise<SynthesizeVoiceoverOutput> => {
  const apiKey = input.apiKey ?? process.env.ELEVENLABS_API_KEY;

  if (!isNonEmptyString(apiKey)) {
    throw new Error(
      "ELEVENLABS_API_KEY is missing. Configure it in your environment."
    );
  }

  const cleanNarration = sanitizeNarration(input.rawNarration);

  if (!isNonEmptyString(cleanNarration)) {
    throw new Error(
      "Narration text is empty after sanitization. Cannot synthesize audio."
    );
  }

  const encodedVoiceId = encodeURIComponent(input.voiceId);
  const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodedVoiceId}/with-timestamps?output_format=mp3_44100_128`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: cleanNarration,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `ElevenLabs TTS synthesis failed with status ${response.status}.`
    );
  }

  const rawJson: unknown = await response.json();
  const data = elevenLabsApiResponseSchema.parse(rawJson);

  const audioBytes = Uint8Array.from(
    atob(data.audio_base64),
    (char) => char.codePointAt(0) ?? 0
  );

  const { words, audioDuration } = parseAlignmentToWords(data.alignment);

  const audioKey = `users/${input.userId}/series/${input.seriesId}/episodes/${input.episodeId}/audio.mp3`;

  await input.storage.upload(audioKey, audioBytes, {
    contentType: "audio/mpeg",
  });

  const audioUrl = await input.storage.url(audioKey);

  const pricePer1k = ELEVENLABS_PRICING.eleven_turbo_v2_5.pricePer1kChars;

  const generationCostUsd = Number(
    ((cleanNarration.length / 1000) * pricePer1k).toFixed(4)
  );

  const metadata: SeriesEpisodeAudioMetadata = {
    audioKey,
    audioDuration,
    wordTimestamps: words,
    characterCount: cleanNarration.length,
    generationCostUsd,
    voiceId: input.voiceId,
    modelId: "eleven_turbo_v2_5",
  };

  return {
    audioUrl,
    audioKey,
    metadata,
  };
};
