import { readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

import type {
  CompletedRenderVideoResult,
  RenderVideoParams,
  VideoRendererService,
} from "./types";

const CONCURRENCY = 2;

export interface LocalRemotionRendererOptions {
  browserExecutable: string;
}

export class LocalRemotionRenderer implements VideoRendererService {
  private readonly options: LocalRemotionRendererOptions;
  private cachedBundleLocation: string | null = null;

  constructor(options: LocalRemotionRendererOptions) {
    this.options = options;
  }

  private async getBundleLocation(): Promise<string> {
    if (this.cachedBundleLocation !== null) {
      return this.cachedBundleLocation;
    }

    const currentDir = import.meta.dirname;
    const entryPoint = path.resolve(currentDir, "../entry.ts");

    this.cachedBundleLocation = await bundle({
      entryPoint,
    });

    return this.cachedBundleLocation;
  }

  async renderVideo(
    params: RenderVideoParams
  ): Promise<CompletedRenderVideoResult> {
    const startTime = Date.now();
    const bundleLocation = await this.getBundleLocation();

    const composition = await selectComposition({
      browserExecutable: this.options.browserExecutable,
      chromiumOptions: {
        disableWebSecurity: true,
      },
      id: "MainVideo",
      inputProps: params.compositionProps,
      serveUrl: bundleLocation,
    });

    const tempOutputPath = path.join(
      tmpdir(),
      `episode_${params.episodeId}_${Date.now()}.mp4`
    );

    try {
      await renderMedia({
        browserExecutable: this.options.browserExecutable,
        chromiumOptions: {
          disableWebSecurity: true,
        },
        codec: "h264",
        composition,
        concurrency: CONCURRENCY,
        crf: 20,
        inputProps: params.compositionProps,
        outputLocation: tempOutputPath,
        serveUrl: bundleLocation,
      });

      const videoBuffer = await readFile(tempOutputPath);
      const videoKey = `users/${params.userId}/series/${params.seriesId}/episodes/${params.episodeId}/video.mp4`;

      await params.storage.upload(videoKey, videoBuffer, {
        contentType: "video/mp4",
      });

      const videoUrl = await params.storage.url(videoKey);
      const fileStat = await stat(tempOutputPath);

      return {
        outputSizeBytes: fileStat.size,
        renderDurationMs: Date.now() - startTime,
        status: "completed",
        videoUrl,
      };
    } finally {
      await rm(tempOutputPath, { force: true });
    }
  }
}
