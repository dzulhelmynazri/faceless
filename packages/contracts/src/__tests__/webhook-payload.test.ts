import { describe, expect, it } from "vitest";

import { renderWebhookPayloadSchema } from "../series";

describe("Webhook Payload Schema", () => {
  it("validates successful render completed payload", () => {
    const valid = {
      episodeId: "ep_abc_123",
      outputSizeBytes: 10_485_760,
      renderDurationMs: 4200,
      status: "completed",
      videoUrl: "https://r2.faceless.video/episodes/video.mp4",
    };

    const result = renderWebhookPayloadSchema.safeParse(valid);

    expect(result.success).toBeTruthy();
  });

  it("validates failed render payload with error reason", () => {
    const failed = {
      episodeId: "ep_abc_123",
      error: "FFmpeg render process terminated unexpectedly",
      status: "failed",
    };

    const result = renderWebhookPayloadSchema.safeParse(failed);

    expect(result.success).toBeTruthy();
  });

  it("rejects completed payload missing videoUrl or with invalid URL", () => {
    const missingUrl = {
      episodeId: "ep_abc_123",
      outputSizeBytes: 1024,
      renderDurationMs: 1200,
      status: "completed",
    };

    const invalidUrl = {
      ...missingUrl,
      videoUrl: "not-a-url",
    };

    expect(
      renderWebhookPayloadSchema.safeParse(missingUrl).success
    ).toBeFalsy();
    expect(
      renderWebhookPayloadSchema.safeParse(invalidUrl).success
    ).toBeFalsy();
  });

  it("rejects failed payload missing error string", () => {
    const missingError = {
      episodeId: "ep_abc_123",
      status: "failed",
    };

    expect(
      renderWebhookPayloadSchema.safeParse(missingError).success
    ).toBeFalsy();
  });

  it("rejects unknown or invalid status discriminator", () => {
    const unknownStatus = {
      episodeId: "ep_abc_123",
      status: "in_progress",
    };

    expect(
      renderWebhookPayloadSchema.safeParse(unknownStatus).success
    ).toBeFalsy();
  });
});
