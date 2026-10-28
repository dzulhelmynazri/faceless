import { registerRoot } from "remotion";

import { RemotionRoot } from "./root";

registerRoot(RemotionRoot);

export { defaultVideoProps } from "./default-props";

export { RemotionRoot } from "./root";

// Composition & Layer Components
export { MainVideo } from "./compositions/main-video";

export { SceneSequence } from "./compositions/scene-sequence";

export type { SceneSequenceProps } from "./compositions/scene-sequence";

export { CaptionLayer } from "./compositions/caption-layer";

export type { CaptionLayerProps } from "./compositions/caption-layer";

export { AudioMixer } from "./compositions/audio-mixer";

export type { AudioMixerProps } from "./compositions/audio-mixer";

export { GlitchShader } from "./compositions/glitch-shader";

export type { GlitchShaderProps } from "./compositions/glitch-shader";

// Core Timing & Window Algorithms
export {
  computeSpeechIntervals,
  getDuckingVolume,
} from "./core/speech-envelope";

export {
  buildCaptionPhrases,
  getCaptionPhraseAtTime,
} from "./core/caption-window";

export type {
  BuildCaptionPhrasesInput,
  GetCaptionPhraseAtTimeInput,
} from "./core/caption-window";

// Styles & Typography
export { ensureCaptionFontsLoaded, FONT_FAMILIES } from "./styles/fonts";

export type { LoadedCaptionFonts } from "./styles/fonts";

export {
  CAPTION_PRESET_CONFIGS,
  getCaptionStyleConfig,
} from "./styles/caption-presets";

export type { CaptionStyleConfig } from "./styles/caption-presets";

// Schemas & Types
export {
  captionStyleIdSchema,
  type CaptionStyleId,
} from "@faceless/contracts/series";

export { videoCompositionPropsSchema, videoSceneItemSchema } from "./types";

export type {
  CaptionPhrase,
  SpeechInterval,
  VideoCompositionProps,
  VideoSceneItem,
} from "./types";
