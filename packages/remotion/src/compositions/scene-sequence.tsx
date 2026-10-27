import * as React from "react";
import {
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import type { VideoSceneItem } from "../types";

export interface SceneSequenceProps {
  scenes: readonly VideoSceneItem[];
}

interface SingleSceneCardProps {
  scene: VideoSceneItem;
  sceneIndex: number;
  durationInFrames: number;
}

const SingleSceneCard: React.FC<SingleSceneCardProps> = ({
  scene,
  sceneIndex,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const isEven = sceneIndex % 2 === 0;

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    isEven ? [1, 1.15] : [1.15, 1],
    { extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    isEven ? [0, -30] : [-30, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      <Img
        alt={`Scene #${scene.sceneNumber}`}
        src={scene.imageUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: isEven ? "center center" : "top center",
        }}
      />
    </div>
  );
};

interface SceneSlice {
  scene: VideoSceneItem;
  index: number;
  durationInFrames: number;
  from: number;
}

export const SceneSequence: React.FC<SceneSequenceProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  const sceneSlices = React.useMemo(() => {
    const slices: SceneSlice[] = [];
    let currentFrame = 0;

    for (const [index, scene] of scenes.entries()) {
      const durationInFrames = Math.max(15, Math.ceil(scene.duration * fps));
      slices.push({
        scene,
        index,
        durationInFrames,
        from: currentFrame,
      });
      currentFrame += durationInFrames;
    }

    return slices;
  }, [scenes, fps]);

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 10,
      }}
    >
      {sceneSlices.map(({ scene, index, durationInFrames, from }) => (
        <Sequence
          durationInFrames={durationInFrames}
          from={from}
          key={`${scene.sceneNumber}-${scene.imageUrl}`}
          name={`Scene #${scene.sceneNumber}`}
        >
          <SingleSceneCard
            durationInFrames={durationInFrames}
            scene={scene}
            sceneIndex={index}
          />
        </Sequence>
      ))}
    </div>
  );
};
