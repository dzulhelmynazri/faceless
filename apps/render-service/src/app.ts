import { timingSafeEqual } from "node:crypto";

import type { RenderWebhookPayload } from "@faceless/contracts/series";
import type { VideoRendererService } from "@faceless/remotion/server";
import { videoCompositionPropsSchema } from "@faceless/remotion/types";
import type { Files } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import { Hono } from "hono";
import { z } from "zod";

export interface RenderAppEnv {
  RENDER_SERVICE_TOKEN: string;
  RENDER_WEBHOOK_SECRET: string;
}

export interface RenderAppDependencies {
  env: RenderAppEnv;
  fetchFn?: typeof fetch;
  renderer: VideoRendererService;
  storage: Files;
}

export const renderJobRequestSchema = z.object({
  callbackUrl: z.url(),
  compositionProps: videoCompositionPropsSchema,
  episodeId: z.string().min(1),
  seriesId: z.string().min(1),
  userId: z.string().min(1),
});

export type RenderJobRequest = z.infer<typeof renderJobRequestSchema>;

const isAuthorized = (
  authorization: string | undefined,
  expectedToken: string
): boolean => {
  if (!isNonEmptyString(authorization)) {
    return false;
  }

  const encoder = new TextEncoder();
  const actual = encoder.encode(authorization);
  const expected = encoder.encode(`Bearer ${expectedToken}`);

  return (
    actual.byteLength === expected.byteLength &&
    timingSafeEqual(actual, expected)
  );
};

export const createRenderApp = ({
  env,
  fetchFn = globalThis.fetch,
  renderer,
  storage,
}: RenderAppDependencies): Hono => {
  const app = new Hono();

  const runJob = async ({
    callbackUrl,
    compositionProps,
    episodeId,
    seriesId,
    userId,
  }: RenderJobRequest): Promise<void> => {
    let payload: RenderWebhookPayload;

    try {
      const result = await renderer.renderVideo({
        callbackUrl,
        compositionProps,
        episodeId,
        seriesId,
        storage,
        userId,
      });

      if (result.status !== "completed") {
        throw new Error("Render job was submitted asynchronously");
      }

      payload = {
        episodeId,
        outputSizeBytes: result.outputSizeBytes,
        renderDurationMs: result.renderDurationMs,
        status: "completed",
        videoUrl: result.videoUrl,
      };
    } catch {
      payload = {
        episodeId,
        error: "Video rendering failed",
        status: "failed",
      };
    }

    try {
      await fetchFn(callbackUrl, {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      // Webhook delivery error ignored
    }
  };

  app.get("/health", (c) =>
    c.json({
      status: "ok",
      uptime: process.uptime(),
    })
  );

  app.post("/jobs", async (c) => {
    if (
      !isAuthorized(c.req.header("Authorization"), env.RENDER_SERVICE_TOKEN)
    ) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body: unknown = await c.req.json().catch(() => null);
    const parsed = renderJobRequestSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Invalid job parameters" }, 400);
    }

    void runJob(parsed.data);

    return c.json(
      {
        jobId: `job_${parsed.data.episodeId}_${Date.now()}`,
        status: "processing",
      },
      202
    );
  });

  return app;
};
