import * as React from "react";
import type { CalculateMetadataFunction } from "remotion";
import { Composition } from "remotion";

import { MainVideo } from "./compositions/main-video";
import { defaultVideoProps } from "./default-props";
import type { VideoCompositionProps } from "./types";
import { videoCompositionPropsSchema } from "./types";

const calculateMetadata: CalculateMetadataFunction<VideoCompositionProps> = ({
  props,
}) => {
  const fps = 30;
  const durationInFrames = Math.max(30, Math.ceil(props.audioDuration * fps));

  return {
    durationInFrames,
  };
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  const durationInFrames = Math.ceil(defaultVideoProps.audioDuration * fps);

  return (
    <Composition
      calculateMetadata={calculateMetadata}
      component={MainVideo}
      defaultProps={defaultVideoProps}
      durationInFrames={durationInFrames}
      fps={fps}
      height={1920}
      id="MainVideo"
      schema={videoCompositionPropsSchema}
      width={1080}
    />
  );
};
