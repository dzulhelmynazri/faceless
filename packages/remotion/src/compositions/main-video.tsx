import * as React from "react";
import { AbsoluteFill } from "remotion";

import { ensureCaptionFontsLoaded } from "../styles/fonts";
import type { VideoCompositionProps } from "../types";
import { AudioMixer } from "./audio-mixer";
import { CaptionLayer } from "./caption-layer";
import { GlitchShader } from "./glitch-shader";
import { SceneSequence } from "./scene-sequence";

export const MainVideo: React.FC<VideoCompositionProps> = ({
  voiceUrl,
  wordTimestamps,
  scenes,
  captionStyleId,
  bgmUrl,
  glitchEffect,
}) => {
  React.useEffect(() => {
    ensureCaptionFontsLoaded();
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Visual scenes with alternating Ken Burns camera motion */}
      <SceneSequence scenes={scenes} />

      {/* Chromatic aberration & CRT scanlines on scene cuts */}
      <GlitchShader enabled={glitchEffect} scenes={scenes} />

      {/* High-retention 2-4 word sliding window captions */}
      <CaptionLayer
        captionStyleId={captionStyleId}
        wordTimestamps={wordTimestamps}
      />

      {/* Synchronized voiceover and dynamically ducked background audio */}
      <AudioMixer
        bgmUrl={bgmUrl}
        voiceUrl={voiceUrl}
        wordTimestamps={wordTimestamps}
      />
    </AbsoluteFill>
  );
};
