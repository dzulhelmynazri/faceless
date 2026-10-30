import type {
  RenderVideoParams,
  RenderVideoResult,
  VideoRendererService,
} from "@faceless/remotion/server";
import { createFiles } from "@faceless/storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createRenderApp } from "../app";

describe("render service", () => {
  const env = {
    RENDER_SERVICE_TOKEN: "mock_test_render_token",
    RENDER_WEBHOOK_SECRET: "mock_test_webhook_secret",
  };

  const mockRenderVideo =
    vi.fn<(params: RenderVideoParams) => Promise<RenderVideoResult>>();

  const renderer: VideoRendererService = {
    renderVideo: mockRenderVideo,
  };

  const storage = createFiles({
    R2_ACCESS_KEY_ID: "mock-key",
    R2_ACCOUNT_ID: "mock-account",
    R2_BUCKET: "mock-bucket",
    R2_PUBLIC_BASE_URL: "https://r2.faceless.video",
    R2_SECRET_ACCESS_KEY: "mock-secret",
  });

  const mockFetch = vi.fn<typeof fetch>();

  const app = createRenderApp({
    env,
    fetchFn: mockFetch,
    renderer,
    storage,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response("OK", { status: 200 }));
  });

  const validPayload = {
    callbackUrl: "https://api.faceless.video/webhooks/render",
    compositionProps: {
      audioDuration: 15,
      bgmUrl: null,
      captionStyleId: "bold-stroke" as const,
      glitchEffect: false,
      scenes: [
        {
          duration: 15,
          id: "scene_1",
          imageUrl: "https://r2.faceless.video/scene1.png",
          narrationText: "In the beginning...",
          sceneNumber: 1,
          visualPrompt: "Cinematic establishing shot",
        },
      ],
      voiceUrl: "https://r2.faceless.video/voice.mp3",
      wordTimestamps: [
        { cleanWord: "in", end: 1, start: 0, word: "In" },
        { cleanWord: "the", end: 2, start: 1, word: "the" },
        { cleanWord: "beginning", end: 3, start: 2, word: "beginning" },
      ],
    },
    episodeId: "ep_123",
    seriesId: "series_456",
    userId: "user_789",
  };

  describe("GET /health", () => {
    it("returns 200 with status ok and uptime", async () => {
      const response = await app.request("/health");

      expect(response.status).toBe(200);

      const healthSchema = z.object({
        status: z.literal("ok"),
        uptime: z.number(),
      });

      const parsed = healthSchema.safeParse(await response.json());

      expect(parsed.success).toBeTruthy();
    });
  });

  describe("POST /jobs authorization", () => {
    it("rejects with 401 when Authorization header is missing", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Unauthorized",
      });
    });

    it("rejects with 401 when Authorization header token is invalid", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: "Bearer invalid_secret_token",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Unauthorized",
      });
    });

    it("rejects with 401 when Authorization header is empty string", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: "",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Unauthorized",
      });
    });

    it("rejects with 401 when Authorization header scheme is not Bearer", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: `Basic ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Unauthorized",
      });
    });
  });

  describe("POST /jobs validation", () => {
    it("rejects with 400 when body is invalid JSON", async () => {
      const response = await app.request("/jobs", {
        body: "invalid-json",
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Invalid job parameters",
      });
    });

    it("rejects with 400 when required fields are missing", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify({
          episodeId: "ep_123",
          userId: "user_789",
        }),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Invalid job parameters",
      });
    });

    it("rejects with 400 when callbackUrl is not a valid URL", async () => {
      const response = await app.request("/jobs", {
        body: JSON.stringify({
          ...validPayload,
          callbackUrl: "not-a-valid-url",
        }),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toStrictEqual({
        error: "Invalid job parameters",
      });
    });
  });

  describe("POST /jobs execution", () => {
    it("returns 202 and processes job asynchronously on success", async () => {
      mockRenderVideo.mockResolvedValueOnce({
        outputSizeBytes: 5_242_880,
        renderDurationMs: 4200,
        status: "completed",
        videoUrl: "https://r2.faceless.video/rendered.mp4",
      });

      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(202);

      const jobResponseSchema = z.object({
        jobId: z.string().regex(/^job_ep_123_\d+$/u),
        status: z.literal("processing"),
      });

      const parsed = jobResponseSchema.safeParse(await response.json());

      expect(parsed.success).toBeTruthy();

      await vi.waitFor(() => {
        expect(mockRenderVideo).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledOnce();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        validPayload.callbackUrl,
        expect.objectContaining({
          body: JSON.stringify({
            episodeId: validPayload.episodeId,
            outputSizeBytes: 5_242_880,
            renderDurationMs: 4200,
            status: "completed",
            videoUrl: "https://r2.faceless.video/rendered.mp4",
          }),
          headers: {
            Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      );
    });

    it("delivers failed status webhook when rendering throws", async () => {
      mockRenderVideo.mockRejectedValueOnce(new Error("Rendering crashed"));

      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(202);

      await vi.waitFor(() => {
        expect(mockRenderVideo).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledOnce();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        validPayload.callbackUrl,
        expect.objectContaining({
          body: JSON.stringify({
            episodeId: validPayload.episodeId,
            error: "Video rendering failed",
            status: "failed",
          }),
          headers: {
            Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      );
    });

    it("delivers failed status webhook when renderer returns non-completed status", async () => {
      mockRenderVideo.mockResolvedValueOnce({
        renderDurationMs: 100,
        status: "submitted",
      });

      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(202);

      await vi.waitFor(() => {
        expect(mockRenderVideo).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledOnce();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        validPayload.callbackUrl,
        expect.objectContaining({
          body: JSON.stringify({
            episodeId: validPayload.episodeId,
            error: "Video rendering failed",
            status: "failed",
          }),
          headers: {
            Authorization: `Bearer ${env.RENDER_WEBHOOK_SECRET}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        })
      );
    });

    it("handles webhook delivery failure gracefully", async () => {
      mockRenderVideo.mockResolvedValueOnce({
        outputSizeBytes: 1000,
        renderDurationMs: 100,
        status: "completed",
        videoUrl: "https://r2.faceless.video/video.mp4",
      });

      mockFetch.mockRejectedValueOnce(new Error("Network timeout"));

      const response = await app.request("/jobs", {
        body: JSON.stringify(validPayload),
        headers: {
          Authorization: `Bearer ${env.RENDER_SERVICE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      expect(response.status).toBe(202);

      await vi.waitFor(() => {
        expect(mockRenderVideo).toHaveBeenCalledOnce();
        expect(mockFetch).toHaveBeenCalledOnce();
      });
    });
  });
});
