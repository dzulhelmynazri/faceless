import { Files, memory } from "@faceless/storage";
import { afterEach, describe, expect, it, vi } from "vitest";

import { defaultVideoProps } from "../default-props";
import {
  CloudflareContainerRenderer,
  createVideoRenderer,
} from "../server/remote-renderer";

const mockStorage = new Files({ adapter: memory() });

describe("VideoRenderer Factory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns CloudflareContainerRenderer when service credentials are provided", () => {
    const renderer = createVideoRenderer({
      serviceToken: "test-token",
      serviceUrl: "https://render.example.com",
    });

    expect(renderer).toBeInstanceOf(CloudflareContainerRenderer);
  });

  it("dispatches render job with authorization header and normalized url", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json(
        { status: "accepted" },
        {
          status: 202,
        }
      )
    );

    const renderer = createVideoRenderer({
      serviceToken: "secret-token",
      serviceUrl: "https://render.example.com///",
    });

    const result = await renderer.renderVideo({
      callbackUrl: "https://app.example.com/api/render/webhook",
      compositionProps: defaultVideoProps,
      episodeId: "ep_123",
      seriesId: "ser_456",
      storage: mockStorage,
      userId: "usr_789",
    });

    expect(result.status).toBe("submitted");
    expect(result.renderDurationMs).toBeGreaterThanOrEqual(0);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://render.example.com/jobs",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer secret-token",
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    );
  });

  it("throws formatted error when remote render container returns non-ok status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("GPU out of memory", {
        status: 500,
      })
    );

    const renderer = createVideoRenderer({
      serviceToken: "secret-token",
      serviceUrl: "https://render.example.com",
    });

    await expect(
      renderer.renderVideo({
        callbackUrl: "https://app.example.com/api/render/webhook",
        compositionProps: defaultVideoProps,
        episodeId: "ep_123",
        seriesId: "ser_456",
        storage: mockStorage,
        userId: "usr_789",
      })
    ).rejects.toThrow(
      "Cloudflare Container render job failed to submit (500): GPU out of memory"
    );
  });
});
