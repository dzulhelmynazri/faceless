import type {
  RenderVideoParams,
  SubmittedRenderVideoResult,
  VideoRendererService,
} from "./types";

export interface CloudflareContainerRendererOptions {
  serviceToken: string;
  serviceUrl: string;
}

export class CloudflareContainerRenderer implements VideoRendererService {
  private readonly options: CloudflareContainerRendererOptions;

  constructor(options: CloudflareContainerRendererOptions) {
    this.options = options;
  }

  async renderVideo(
    params: RenderVideoParams
  ): Promise<SubmittedRenderVideoResult> {
    const startTime = Date.now();
    const endpoint = `${this.options.serviceUrl.replace(/\/+$/u, "")}/jobs`;

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        callbackUrl: params.callbackUrl,
        compositionProps: params.compositionProps,
        episodeId: params.episodeId,
        seriesId: params.seriesId,
        userId: params.userId,
      }),
      headers: {
        Authorization: `Bearer ${this.options.serviceToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Cloudflare Container render job failed to submit (${response.status}): ${errorText}`
      );
    }

    return {
      renderDurationMs: Date.now() - startTime,
      status: "submitted",
    };
  }
}
