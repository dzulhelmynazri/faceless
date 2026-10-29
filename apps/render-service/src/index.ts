import { timingSafeEqual } from "node:crypto";

import type { RenderWebhookPayload } from "@faceless/contracts/series";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
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

const renderJobRequestSchema = z.object({
  callbackUrl: z.url(),
  compositionProps: videoCompositionPropsSchema,
  episodeId: z.string().min(1),
  seriesId: z.string().min(1),
  userId: z.string().min(1),
});

type RenderJobRequest = z.infer<typeof renderJobRequestSchema>;

const isAuthorized = (authorization: string | undefined): boolean => {
  if (!isNonEmptyString(authorization)) {
    return false;
  }

  const encoder = new TextEncoder();
  const actual = encoder.encode(authorization);
  const expected = encoder.encode(`Bearer ${env.RENDER_SERVICE_TOKEN}`);

  return (
    actual.byteLength === expected.byteLength &&
    timingSafeEqual(actual, expected)
  );
};

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

    payload = {
      episodeId,
      outputSizeBytes: result.outputSizeBytes,
      renderDurationMs: result.renderDurationMs,
      status: "completed",
      videoUrl: result.videoUrl,
    };
  } catch (error) {
    console.error("Video rendering failed:", error);

    payload = {
      episodeId,
      error: "Video rendering failed",
      status: "failed",
    };
  }

  try {
    const response = await fetch(callbackUrl, {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Webhook failed:", response.status);
    }
  } catch (error) {
    console.error("Webhook delivery failed:", error);
  }
};

app.get("/health", (c) =>
  c.json({
    status: "ok",
    uptime: process.uptime(),
  })
);

app.post("/jobs", async (c) => {
  if (!isAuthorized(c.req.header("Authorization"))) {
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

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

process.on("SIGINT", () => {
  server.close();
});

process.on("SIGTERM", () => {
  server.close();
});

export default app;
