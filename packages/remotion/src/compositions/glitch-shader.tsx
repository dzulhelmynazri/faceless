import * as React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import type { VideoSceneItem } from "../types";

export interface GlitchShaderProps {
  enabled: boolean;
  scenes: readonly VideoSceneItem[];
}

export const GlitchShader: React.FC<GlitchShaderProps> = ({
  enabled,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find transition cut frames (starts of each scene)
  const cutFrames = React.useMemo(() => {
    const cuts: number[] = [];
    let acc = 0;

    for (const [i, scene] of scenes.entries()) {
      if (i > 0) {
        cuts.push(acc);
      }

      acc += Math.max(15, Math.ceil(scene.duration * fps));
    }

    return cuts;
  }, [scenes, fps]);

  if (!enabled) {
    return null;
  }

  // Check if current frame is within a 6-frame window of any scene cut
  const activeCutFrame = cutFrames.find(
    (cut) => frame >= cut && frame <= cut + 6
  );

  if (activeCutFrame === undefined) {
    return null;
  }

  const offsetInCut = frame - activeCutFrame;

  const horizontalShift = interpolate(
    offsetInCut,
    [0, 2, 4, 6],
    [12, -10, 6, 0],
    { extrapolateRight: "clamp" }
  );

  const verticalJitter = interpolate(
    offsetInCut,
    [0, 2, 4, 6],
    [-3, 4, -2, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 25,
        mixBlendMode: "screen",
        overflow: "hidden",
      }}
    >
      {/* Cyan split channel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(6, 182, 212, 0.22)",
          transform: `translateX(${horizontalShift}px) translateY(${verticalJitter}px)`,
          filter: "contrast(180%)",
        }}
      />

      {/* Red split channel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(239, 68, 68, 0.22)",
          transform: `translateX(${-horizontalShift}px) translateY(${-verticalJitter}px)`,
          filter: "contrast(180%)",
        }}
      />

      {/* CRT Scanline bars */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35) 2px, transparent 2px, transparent 6px)",
          opacity: 0.6,
        }}
      />
    </div>
  );
};
