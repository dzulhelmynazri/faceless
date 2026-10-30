import { afterEach, describe, expect, it, vi } from "vitest";

import { createEmail } from "../index";

describe("createEmail factory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("instantiates email client with cloudflare as default adapter", () => {
    const client = createEmail({
      CLOUDFLARE_ACCOUNT_ID: "acc_123",
      CLOUDFLARE_API_TOKEN: "tok_456",
    });

    expect(client.defaultAdapter).toBe("cloudflare");
    expect(client.adapters.has("cloudflare")).toBeTruthy();
  });

  it("dispatches outbound email to Cloudflare API with authorization headers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        result: { id: "msg_sent_123" },
        success: true,
      })
    );

    const client = createEmail({
      CLOUDFLARE_ACCOUNT_ID: "acc_prod_abc",
      CLOUDFLARE_API_TOKEN: "cf_secret_token",
    });

    await client.send({
      from: "notifications@faceless.video",
      subject: "Your video is ready",
      text: "Your episode has finished rendering.",
      to: "creator@example.com",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/acc_prod_abc/email/sending/send",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer cf_secret_token",
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    );
  });

  it("propagates error when Cloudflare API returns non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Unauthorized", {
        status: 401,
      })
    );

    const client = createEmail({
      CLOUDFLARE_ACCOUNT_ID: "acc_invalid",
      CLOUDFLARE_API_TOKEN: "bad_token",
    });

    await expect(
      client.send({
        from: "notifications@faceless.video",
        subject: "Test",
        text: "Hello",
        to: "creator@example.com",
      })
    ).rejects.toThrow("cloudflare failed with HTTP 401.");
  });
});
