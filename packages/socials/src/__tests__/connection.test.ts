import { describe, expect, it } from "vitest";

import { createSocialClient } from "../client";
import {
  createPlatformConnectionUrl,
  zernioConnectionResultSchema,
  zernioProfileListSchema,
} from "../connection";

describe("createPlatformConnectionUrl service", () => {
  it("rejects when social provider backend lacks hosted connection capabilities", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    await expect(
      createPlatformConnectionUrl(client, {
        platform: "tiktok",
        redirectUrl: "https://example.com/oauth/callback",
        tenantId: "tenant-1",
      })
    ).rejects.toThrow(
      "Active social provider does not support hosted connection flows"
    );
  });
});

describe("zernioProfileListSchema contract", () => {
  it("validates arrays containing valid provider profiles", () => {
    const valid = zernioProfileListSchema.safeParse([
      { _id: "profile_abc123" },
      { _id: "profile_def456" },
    ]);

    expect(valid.success).toBeTruthy();
  });

  it("rejects profiles with empty identifier strings", () => {
    const invalid = zernioProfileListSchema.safeParse([{ _id: "" }]);

    expect(invalid.success).toBeFalsy();
  });

  it("rejects payloads missing the _id identifier key", () => {
    const invalid = zernioProfileListSchema.safeParse([
      { id: "profile_abc123" },
    ]);

    expect(invalid.success).toBeFalsy();
  });
});

describe("zernioConnectionResultSchema contract", () => {
  it("validates URL objects returned by hosted connection endpoint", () => {
    const valid = zernioConnectionResultSchema.safeParse({
      url: "https://auth.zernio.com/oauth/authorize?state=xyz",
    });

    expect(valid.success).toBeTruthy();
  });

  it("rejects invalid URL formats", () => {
    const invalid = zernioConnectionResultSchema.safeParse({
      url: "not-a-valid-http-url",
    });

    expect(invalid.success).toBeFalsy();
  });
});
