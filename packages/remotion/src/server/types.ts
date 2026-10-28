import type { Files } from "@faceless/storage";

import type { VideoCompositionProps } from "../types";

export interface RenderVideoParams {
  callbackUrl: string;
  compositionProps: VideoCompositionProps;
  episodeId: string;
  seriesId: string;
  storage: Files;
  userId: string;
}

export interface CompletedRenderVideoResult {
  outputSizeBytes: number;
  renderDurationMs: number;
  status: "completed";
  videoUrl: string;
}

export interface SubmittedRenderVideoResult {
  renderDurationMs: number;
  status: "submitted";
}

export type RenderVideoResult =
  | CompletedRenderVideoResult
  | SubmittedRenderVideoResult;

export interface VideoRendererService {
  renderVideo: (params: RenderVideoParams) => Promise<RenderVideoResult>;
}
