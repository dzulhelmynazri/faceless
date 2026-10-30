import { describe, expect, it, vi } from "vitest";

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

  it("rejects when listProfiles returns invalid payload", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    Object.defineProperty(client, "native", {
      value: () => ({
        createConnection: vi.fn<() => Promise<void>>(),
        listProfiles: vi
          .fn<() => Promise<string>>()
          .mockResolvedValue("invalid"),
      }),
    });

    await expect(
      createPlatformConnectionUrl(client, {
        platform: "tiktok",
        redirectUrl: "https://example.com/oauth/callback",
        tenantId: "tenant-1",
      })
    ).rejects.toThrow("Invalid profiles response from social provider");
  });

  it("rejects when no active profile is found in social provider", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    Object.defineProperty(client, "native", {
      value: () => ({
        createConnection: vi.fn<() => Promise<void>>(),
        listProfiles: vi
          .fn<() => Promise<{ _id: string }[]>>()
          .mockResolvedValue([]),
      }),
    });

    await expect(
      createPlatformConnectionUrl(client, {
        platform: "tiktok",
        redirectUrl: "https://example.com/oauth/callback",
        tenantId: "tenant-1",
      })
    ).rejects.toThrow("No active profile found in social provider");
  });

  it("rejects when connection creation returns invalid URL response", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    Object.defineProperty(client, "native", {
      value: () => ({
        createConnection: vi
          .fn<() => Promise<{ url: string }>>()
          .mockResolvedValue({ url: "not-a-valid-url" }),
        listProfiles: vi
          .fn<() => Promise<{ _id: string }[]>>()
          .mockResolvedValue([{ _id: "profile_123" }]),
      }),
    });

    await expect(
      createPlatformConnectionUrl(client, {
        platform: "tiktok",
        redirectUrl: "https://example.com/oauth/callback",
        tenantId: "tenant-1",
      })
    ).rejects.toThrow("Invalid connection response from social provider");
  });

  it("returns hosted connection URL when creation succeeds", async () => {
    const client = createSocialClient({
      mockScenario: "immediate-text-success",
      provider: "mock",
    });

    Object.defineProperty(client, "native", {
      value: () => ({
        createConnection: vi
          .fn<() => Promise<{ url: string }>>()
          .mockResolvedValue({
            url: "https://auth.zernio.com/oauth/authorize?state=xyz",
          }),
        listProfiles: vi
          .fn<() => Promise<{ _id: string }[]>>()
          .mockResolvedValue([{ _id: "profile_123" }]),
      }),
    });

    const url = await createPlatformConnectionUrl(client, {
      platform: "tiktok",
      redirectUrl: "https://example.com/oauth/callback",
      tenantId: "tenant-1",
    });

    expect(url).toBe("https://auth.zernio.com/oauth/authorize?state=xyz");
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
