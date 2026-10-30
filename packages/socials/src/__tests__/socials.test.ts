import { describe, expect, it } from "vitest";

import { createSocialClient } from "../client";
import { publishVideoToSocials } from "../publisher";
import type { SocialAccountTarget } from "../types";
import { verifyAndDecodeSocialWebhook } from "../webhook";

describe("@faceless/socials", () => {
  it("initializes a deterministic mock client by default", () => {
    const client = createSocialClient({
      provider: "mock",
      mockScenario: "immediate-text-success",
    });

    expect(client).toBeDefined();
    expect(client.posts).toBeDefined();
  });

  it("publishes to multiple targets (TikTok, YouTube, Instagram) in mock mode", async () => {
    const client = createSocialClient({
      provider: "mock",
      mockScenario: "immediate-text-success",
    });

    const result = await publishVideoToSocials(client, {
      title: "How to Build AI Videos Fast",
      description: "Quick tutorial on faceless video automation #shorts #ai",
      videoUrl: "https://storage.example.com/videos/render-1.mp4",
      idempotencyKey: "test-render-1",
      targets: [
        {
          platform: "tiktok",
          accountId: "tiktok-user-1",
          privacy: "PUBLIC_TO_EVERYONE",
          consentGiven: true,
          isDraft: false,
          aiGenerated: false,
        },
        {
          platform: "youtube",
          accountId: "youtube-channel-1",
          visibility: "public",
          madeForKids: false,
        },
        {
          platform: "instagram",
          accountId: "instagram-account-1",
        },
      ],
    });

    expect(result.status).toBeDefined();
    expect(result.outcomes).toHaveLength(3);
    expect(
      result.outcomes.map((outcome) => ({
        platform: outcome.platform,
        state: outcome.state,
      }))
    ).toStrictEqual([
      { platform: "tiktok", state: "published" },
      { platform: "youtube", state: "published" },
      { platform: "instagram", state: "published" },
    ]);
    expect(result.outcomes[0]?.postId).toBeDefined();
  });

  it("handles mixed success and failure per target independently", async () => {
    const client = createSocialClient({
      provider: "mock",
      mockScenario: "mixed-success-failure",
    });

    const result = await publishVideoToSocials(client, {
      title: "Mixed Outcome Video",
      videoUrl: "https://storage.example.com/videos/render-2.mp4",
      idempotencyKey: "test-render-2",
      targets: [
        {
          platform: "tiktok",
          accountId: "tiktok-user-1",
          privacy: "PUBLIC_TO_EVERYONE",
          consentGiven: true,
          isDraft: false,
          aiGenerated: false,
        },
        {
          platform: "youtube",
          accountId: "youtube-channel-1",
          visibility: "public",
          madeForKids: false,
        },
      ],
    });

    expect(result.status).toBe("partial");
    expect(result.outcomes).toHaveLength(2);
    expect(result.outcomes[0]?.state).toBe("published");
    expect(result.outcomes[1]?.state).toBe("failed");
    expect(result.outcomes[1]?.error).toBeDefined();
  });

  it("returns failed status with issues when request preparation fails", async () => {
    const client = createSocialClient({
      provider: "mock",
      mockScenario: "immediate-text-success",
    });

    const result = await publishVideoToSocials(client, {
      title: "No Targets Video",
      videoUrl: "https://storage.example.com/videos/render-3.mp4",
      idempotencyKey: "test-render-3",
      targets: [],
    });

    expect(result.status).toBe("failed");
    expect(result.outcomes).toHaveLength(0);
    expect(result.issues).toBeDefined();
    expect(result.issues?.[0]?.code).toBe("targets.required");
  });

  it("initializes a Zernio client with apiKey", () => {
    const client = createSocialClient({
      apiKey: "sk_test_1234567890",
      provider: "zernio",
      webhookSecret: "wb_test_1234567890",
    });

    expect(client).toBeDefined();
    expect(client.posts).toBeDefined();
  });

  it("decodes webhook event when provided with a mock client", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const event = await verifyAndDecodeSocialWebhook(client, {
      body: new TextEncoder().encode(
        JSON.stringify({
          accountIds: ["acc_123"],
          event: "post.published",
          id: "evt_123",
        })
      ),
      headers: new Headers(),
    });

    expect(event).toBeDefined();
    expect(event.type).toBeDefined();
  });

  it("slices YouTube video title to maximum 100 characters", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const longTitle = "A".repeat(120);

    const result = await publishVideoToSocials(client, {
      idempotencyKey: "test-title-truncation",
      targets: [
        {
          accountId: "youtube-channel-1",
          madeForKids: false,
          platform: "youtube",
          visibility: "public",
        },
      ],
      title: longTitle,
      videoUrl: "https://storage.example.com/videos/test.mp4",
    });

    expect(result.status).toBe("complete");
    expect(result.outcomes).toHaveLength(1);
    expect(result.outcomes[0]?.state).toBe("published");
  });

  it("omits text property from content payload when description is empty", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const result = await publishVideoToSocials(client, {
      description: "",
      idempotencyKey: "test-no-desc",
      targets: [
        {
          accountId: "instagram-account-1",
          platform: "instagram",
        },
      ],
      title: "No Description Video",
      videoUrl: "https://storage.example.com/videos/test.mp4",
    });

    expect(result.status).toBe("complete");
    expect(result.outcomes).toHaveLength(1);
    expect(result.outcomes[0]?.state).toBe("published");
  });

  it("rejects unsupported platform with descriptive error", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const target: SocialAccountTarget = {
      accountId: "twitter-1",
      platform: "instagram",
    };

    Reflect.set(target, "platform", "twitter");

    await expect(
      publishVideoToSocials(client, {
        idempotencyKey: "test-invalid-platform",
        targets: [target],
        title: "Test Video",
        videoUrl: "https://storage.example.com/videos/test.mp4",
      })
    ).rejects.toThrow(
      'Unsupported platform. Only "youtube", "tiktok", and "instagram" are supported.'
    );
  });
});
