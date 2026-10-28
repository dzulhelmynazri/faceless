import { timingSafeEqual } from "node:crypto";

import type { RenderWebhookPayload } from "@faceless/contracts/series";
import { LocalRemotionRenderer } from "@faceless/remotion/server";
import { videoCompositionPropsSchema } from "@faceless/remotion/types";
import { createFiles } from "@faceless/storage";
import { isNonEmptyString } from "@faceless/utils";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";

import { env } from "./env.server";

const app = new Hono();
const storage = createFiles(env);
const renderer = new LocalRemotionRenderer();

const isAuthorized = (
  authHeader: string | undefined,
  expectedToken: string
): boolean => {
  if (!isNonEmptyString(authHeader)) {
    return false;
  }

  const encoder = new TextEncoder();
  const headerBuffer = encoder.encode(authHeader);
  const expectedBuffer = encoder.encode(`Bearer ${expectedToken}`);

  if (headerBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(headerBuffer, expectedBuffer);
};

const renderJobRequestSchema = z.object({
  callbackUrl: z.url(),
  compositionProps: videoCompositionPropsSchema,
  episodeId: z.string().min(1),
  seriesId: z.string().min(1),
  userId: z.string().min(1),
});

app.get("/health", (c) =>
  c.json({
    status: "ok",
    uptime: process.uptime(),
  })
);

app.post("/jobs", async (c) => {
  const authHeader = c.req.header("Authorization");

  if (!isAuthorized(authHeader, env.RENDER_SERVICE_TOKEN)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const rawBody: unknown = await c.req.json().catch(() => null);
  const parsed = renderJobRequestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return c.json({ error: "Invalid job parameters" }, 400);
  }

  const { episodeId, userId, seriesId, compositionProps, callbackUrl } =
    parsed.data;

  // Execute render asynchronously in background
  const runJob = async () => {
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
      await fetch(callbackUrl, {
        body: JSON.stringify(payload),
        headers: {
          Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } catch {
      // Safe to ignore delivery failure in background task
    }
  };

  void runJob();

  return c.json(
    {
      jobId: `job_${episodeId}_${Date.now()}`,
      status: "processing",
    },
    202
  );
});

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

const onShutdown = () => {
  server.close();
  process.exit(0);
};

process.on("SIGINT", onShutdown);

process.on("SIGTERM", onShutdown);

export default app;
