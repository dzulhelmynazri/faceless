import { createGatewayProvider } from "@ai-sdk/gateway";
import type { WordTimestamp } from "@faceless/contracts/series";
import type { Files } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import { generateImage } from "ai";

import { ENV } from "../../env";
import { calibrateSceneDurations } from "./calibrator";
import { enrichPromptWithStyle } from "./enricher";

export interface ScenePayloadInput {
  sceneNumber: number;
  narrationChunk: string;
  visualPrompt: string;
  estimatedSeconds: number;
}

export interface GenerateEpisodeScenesInput {
  userId: string;
  seriesId: string;
  episodeId: string;
  artStyleId: string;
  scenes: readonly ScenePayloadInput[];
  wordTimestamps: readonly WordTimestamp[];
  audioDuration: number;
  storage: Files;
}

export interface GeneratedSceneRecord {
  sceneNumber: number;
  narrationText: string;
  visualPrompt: string;
  imageUrl: string;
  imageKey: string;
  duration: number;
}

export interface GenerateEpisodeScenesOutput {
  scenes: GeneratedSceneRecord[];
  thumbnailUrl: string;
}

export interface RegenerateSingleSceneInput {
  userId: string;
  seriesId: string;
  episodeId: string;
  artStyleId: string;
  sceneNumber: number;
  narrationChunk: string;
  visualPrompt: string;
  duration: number;
  promptOverride?: string;
  storage: Files;
}

export const DEFAULT_VISUAL_MODEL = "black-forest-labs/flux-schnell";

const getGateway = () =>
  createGatewayProvider({ apiKey: ENV.AI_GATEWAY_API_KEY });

export const generateEpisodeScenes = async (
  input: GenerateEpisodeScenesInput
): Promise<GenerateEpisodeScenesOutput> => {
  const model = getGateway().imageModel(DEFAULT_VISUAL_MODEL);

  const calibrated = calibrateSceneDurations({
    scenes: input.scenes,
    wordTimestamps: input.wordTimestamps,
    audioDuration: input.audioDuration,
  });

  const durationMap = new Map(
    calibrated.map((item) => [item.sceneNumber, item.duration])
  );

  const generateSingle = async (
    scene: ScenePayloadInput
  ): Promise<GeneratedSceneRecord> => {
    const enrichedPrompt = enrichPromptWithStyle({
      visualPrompt: scene.visualPrompt,
      artStyleId: input.artStyleId,
    });

    const duration =
      durationMap.get(scene.sceneNumber) ?? scene.estimatedSeconds;

    const storageKey = `users/${input.userId}/series/${input.seriesId}/episodes/${input.episodeId}/scenes/scene_${scene.sceneNumber}.webp`;

    const { image } = await generateImage({
      model,
      prompt: enrichedPrompt,
      aspectRatio: "9:16",
      providerOptions: {
        gateway: {
          user: input.userId,
          quotaEntityId: input.userId,
          tags: [`series:${input.seriesId}`, `episode:${input.episodeId}`],
        },
      },
    });

    await input.storage.upload(storageKey, image.uint8Array, {
      contentType: image.mediaType,
    });

    const imageUrl = await input.storage.url(storageKey);

    return {
      sceneNumber: scene.sceneNumber,
      narrationText: scene.narrationChunk,
      visualPrompt: scene.visualPrompt,
      imageUrl,
      imageKey: storageKey,
      duration,
    };
  };

  if (input.scenes.length === 0) {
    throw new Error("Cannot generate visual assets: episode has no scenes");
  }

  const firstAttempts = await Promise.allSettled(
    input.scenes.map(generateSingle)
  );

  const results: GeneratedSceneRecord[] = [];
  const failedScenes: ScenePayloadInput[] = [];

  for (const [index, scene] of input.scenes.entries()) {
    const attempt = firstAttempts[index];

    if (attempt?.status === "fulfilled") {
      results.push(attempt.value);
    } else {
      failedScenes.push(scene);
    }
  }

  if (failedScenes.length > 0) {
    const retryAttempts = await Promise.allSettled(
      failedScenes.map(generateSingle)
    );

    for (const retry of retryAttempts) {
      if (retry.status === "fulfilled") {
        results.push(retry.value);
      }
    }
  }

  results.sort((a, b) => a.sceneNumber - b.sceneNumber);

  if (results.length !== input.scenes.length) {
    const missingSceneNumbers: number[] = [];

    for (const scene of input.scenes) {
      if (!results.some((r) => r.sceneNumber === scene.sceneNumber)) {
        missingSceneNumbers.push(scene.sceneNumber);
      }
    }

    throw new Error(
      `Failed to generate visual assets for scene(s): ${missingSceneNumbers.join(", ")}`
    );
  }

  const primaryScene = results.find((r) => r.sceneNumber === 1) ?? results[0];

  if (!primaryScene) {
    throw new Error("Failed to resolve thumbnail: no scenes generated");
  }

  return {
    scenes: results,
    thumbnailUrl: primaryScene.imageUrl,
  };
};

export const regenerateSingleScene = async (
  input: RegenerateSingleSceneInput
): Promise<GeneratedSceneRecord> => {
  const model = getGateway().imageModel(DEFAULT_VISUAL_MODEL);

  const effectivePrompt = isNonEmptyString(input.promptOverride)
    ? input.promptOverride
    : input.visualPrompt;

  const enrichedPrompt = enrichPromptWithStyle({
    visualPrompt: effectivePrompt,
    artStyleId: input.artStyleId,
  });

  const storageKey = `users/${input.userId}/series/${input.seriesId}/episodes/${input.episodeId}/scenes/scene_${input.sceneNumber}.webp`;

  const { image } = await generateImage({
    model,
    prompt: enrichedPrompt,
    aspectRatio: "9:16",
    providerOptions: {
      gateway: {
        user: input.userId,
        quotaEntityId: input.userId,
        tags: [`series:${input.seriesId}`, `episode:${input.episodeId}`],
      },
    },
  });

  await input.storage.upload(storageKey, image.uint8Array, {
    contentType: image.mediaType,
  });

  const imageUrl = await input.storage.url(storageKey);

  return {
    sceneNumber: input.sceneNumber,
    narrationText: input.narrationChunk,
    visualPrompt: effectivePrompt,
    imageUrl,
    imageKey: storageKey,
    duration: input.duration,
  };
};
