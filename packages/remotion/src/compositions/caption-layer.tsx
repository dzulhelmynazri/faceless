import type { CaptionStyleId, WordTimestamp } from "@faceless/contracts/series";
import * as React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

import {
  buildCaptionPhrases,
  getCaptionPhraseAtTime,
} from "../core/caption-window";
import { getCaptionStyleConfig } from "../styles/caption-presets";

export interface CaptionLayerProps {
  wordTimestamps: readonly WordTimestamp[];
  captionStyleId: CaptionStyleId;
}

export const CaptionLayer: React.FC<CaptionLayerProps> = ({
  wordTimestamps,
  captionStyleId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const phrases = React.useMemo(
    () => buildCaptionPhrases({ wordTimestamps, maxWordsPerPhrase: 3 }),
    [wordTimestamps]
  );

  const activePhrase = getCaptionPhraseAtTime({
    phrases,
    currentTime,
  });

  const styleConfig = React.useMemo(
    () => getCaptionStyleConfig(captionStyleId),
    [captionStyleId]
  );

  if (!activePhrase) {
    return null;
  }

  const content = (
    <div style={styleConfig.containerStyle}>
      {activePhrase.words.map((w, index) => {
        const isActive = index === activePhrase.activeWordIndex;

        return (
          <span
            key={`${w.word}-${w.start}`}
            style={styleConfig.wordStyle(isActive)}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "320px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 48px",
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      {styleConfig.wrapperStyle ? (
        <div style={styleConfig.wrapperStyle}>{content}</div>
      ) : (
        content
      )}
    </div>
  );
};
