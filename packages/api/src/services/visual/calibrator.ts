import type { WordTimestamp } from "@faceless/contracts/series";

export interface SceneDurationInput {
  sceneNumber: number;
  narrationChunk: string;
  estimatedSeconds: number;
}

export interface CalibratedSceneDuration {
  sceneNumber: number;
  duration: number;
}

const countWords = (text: string): number =>
  text
    .trim()
    .split(/\s+/u)
    .filter((w) => w.length > 0).length;

export interface CalibrateSceneDurationsInput {
  scenes: readonly SceneDurationInput[];
  wordTimestamps: readonly WordTimestamp[];
  audioDuration: number;
}

export const calibrateSceneDurations = ({
  scenes,
  wordTimestamps,
  audioDuration,
}: CalibrateSceneDurationsInput): CalibratedSceneDuration[] => {
  if (scenes.length === 0) {
    return [];
  }

  const [firstScene] = scenes;

  if (scenes.length === 1 && firstScene) {
    return [
      {
        sceneNumber: firstScene.sceneNumber,
        duration: Math.max(0.5, Number(audioDuration.toFixed(2))),
      },
    ];
  }

  const totalWords = wordTimestamps.length;

  if (totalWords === 0 || audioDuration <= 0) {
    const totalEstimated = scenes.reduce(
      (sum, s) => sum + Math.max(1, s.estimatedSeconds),
      0
    );

    let remainingDuration = audioDuration;

    return scenes.map((scene, index) => {
      const isLast = index === scenes.length - 1;

      if (isLast) {
        return {
          sceneNumber: scene.sceneNumber,
          duration: Math.max(0.5, Number(remainingDuration.toFixed(2))),
        };
      }

      const fraction = Math.max(1, scene.estimatedSeconds) / totalEstimated;
      const allocated = Number((audioDuration * fraction).toFixed(2));
      remainingDuration -= allocated;

      return {
        sceneNumber: scene.sceneNumber,
        duration: Math.max(0.5, allocated),
      };
    });
  }

  const sceneWordCounts = scenes.map((scene) =>
    countWords(scene.narrationChunk)
  );

  const totalScriptWords = sceneWordCounts.reduce(
    (sum, count) => sum + count,
    0
  );

  let currentWordIndex = 0;
  let previousSceneEndTime = 0;

  return scenes.map((scene, index) => {
    const isLast = index === scenes.length - 1;
    const wordCount = sceneWordCounts[index] ?? 0;

    let targetWords = wordCount;

    if (totalScriptWords > 0 && totalWords !== totalScriptWords) {
      const proportionalRatio = wordCount / totalScriptWords;
      targetWords = Math.max(1, Math.round(totalWords * proportionalRatio));
    }

    const endIndex = isLast
      ? totalWords - 1
      : Math.min(currentWordIndex + targetWords - 1, totalWords - 1);

    const endWord = wordTimestamps[endIndex];

    const startTime = index === 0 ? 0 : previousSceneEndTime;

    const rawEndTime = isLast
      ? audioDuration
      : (endWord?.end ?? startTime + scene.estimatedSeconds);

    const endTime = Math.min(
      audioDuration,
      Math.max(startTime + 0.5, rawEndTime)
    );

    const duration = Number((endTime - startTime).toFixed(2));

    previousSceneEndTime = endTime;
    currentWordIndex = endIndex + 1;

    return {
      sceneNumber: scene.sceneNumber,
      duration: Math.max(0.5, duration),
    };
  });
};
