import { afterEach, describe, expect, it, vi } from "vitest";

import { createSocialClient } from "../client";
import { verifyAndDecodeSocialWebhook } from "../webhook";

describe(verifyAndDecodeSocialWebhook, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws error when adapter does not support webhooks", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const adapter = client.adapter("default", { acknowledgeUnsafe: true });

    Reflect.deleteProperty(adapter, "webhooks");

    vi.spyOn(client, "adapter").mockReturnValue(adapter);

    await expect(
      verifyAndDecodeSocialWebhook(client, {
        body: new Uint8Array(),
        headers: new Headers(),
      })
    ).rejects.toThrow("Active provider does not support webhooks");
  });

  it("propagates verification failure when signature is invalid", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const adapter = client.adapter("default", { acknowledgeUnsafe: true });

    if (adapter.webhooks) {
      vi.spyOn(adapter.webhooks, "verify").mockRejectedValueOnce(
        new Error("Invalid webhook signature")
      );
    }

    await expect(
      verifyAndDecodeSocialWebhook(client, {
        body: new Uint8Array(),
        headers: new Headers(),
      })
    ).rejects.toThrow("Invalid webhook signature");
  });

  it("decodes and parses complete event payload", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const adapter = client.adapter("default", { acknowledgeUnsafe: true });

    if (adapter.webhooks) {
      vi.spyOn(adapter.webhooks, "decode").mockResolvedValueOnce({
        accountIds: ["acc_100", "acc_200"],
        backendRecordId: "rec_abc",
        originalType: "video.uploaded",
        type: "video.completed",
      });
    }

    const event = await verifyAndDecodeSocialWebhook(client, {
      body: new Uint8Array(),
      headers: new Headers(),
    });

    expect(event).toStrictEqual({
      accountIds: ["acc_100", "acc_200"],
      backendRecordId: "rec_abc",
      originalType: "video.uploaded",
      type: "video.completed",
    });
  });

  it("applies default schema values for omitted optional event fields", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const adapter = client.adapter("default", { acknowledgeUnsafe: true });

    if (adapter.webhooks) {
      vi.spyOn(adapter.webhooks, "decode").mockResolvedValueOnce({});
    }

    const event = await verifyAndDecodeSocialWebhook(client, {
      body: new Uint8Array(),
      headers: new Headers(),
    });

    expect(event).toStrictEqual({
      accountIds: [],
      originalType: "unknown",
      type: "unknown",
    });
  });

  it("fails schema validation when backendRecordId is an empty string", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    const adapter = client.adapter("default", { acknowledgeUnsafe: true });

    if (adapter.webhooks) {
      vi.spyOn(adapter.webhooks, "decode").mockResolvedValueOnce({
        backendRecordId: "",
      });
    }

    await expect(
      verifyAndDecodeSocialWebhook(client, {
        body: new Uint8Array(),
        headers: new Headers(),
      })
    ).rejects.toThrow(/too_small/u);
  });
});
