import { describe, expect, it } from "vitest";

import {
  oauthCallbackQuerySchema,
  socialConnectionItemSchema,
  socialPlatformParamSchema,
  socialPlatformSchema,
} from "../social";

describe("socialPlatformSchema contract", () => {
  it("accepts supported uppercase platforms", () => {
    expect(socialPlatformSchema.safeParse("TIKTOK").success).toBeTruthy();
    expect(socialPlatformSchema.safeParse("YOUTUBE").success).toBeTruthy();
    expect(socialPlatformSchema.safeParse("INSTAGRAM").success).toBeTruthy();
  });

  it("rejects unsupported platform names", () => {
    expect(socialPlatformSchema.safeParse("TWITTER").success).toBeFalsy();
    expect(socialPlatformSchema.safeParse("FACEBOOK").success).toBeFalsy();
  });
});

describe("socialPlatformParamSchema contract", () => {
  it("normalizes case-insensitive input to uppercase platform enum", () => {
    expect(socialPlatformParamSchema.parse("tiktok")).toBe("TIKTOK");
    expect(socialPlatformParamSchema.parse("YouTube")).toBe("YOUTUBE");
  });

  it("rejects invalid platform strings", () => {
    expect(socialPlatformParamSchema.safeParse("linkedin").success).toBeFalsy();
  });
});

describe("oauthCallbackQuerySchema contract", () => {
  it("validates successful callback query with platform transform", () => {
    const valid = {
      code: "auth_code_123",
      platform: "instagram",
      redirect_uri: "https://faceless.video/api/social/callback",
      state: "random_state_nonce",
    };

    const parsed = oauthCallbackQuerySchema.parse(valid);

    expect(parsed.platform).toBe("INSTAGRAM");
  });

  it("rejects callback query missing redirect_uri", () => {
    const missing = {
      code: "auth_code_123",
      platform: "tiktok",
    };

    expect(oauthCallbackQuerySchema.safeParse(missing).success).toBeFalsy();
  });
});

describe("socialConnectionItemSchema contract", () => {
  it("validates valid connection object with ISO datetime", () => {
    const valid = {
      avatarUrl: "https://r2.faceless.video/avatars/u1.png",
      connectedAt: "2026-10-30T10:00:00.000Z",
      id: "conn_123",
      platform: "TIKTOK" as const,
      platformUserName: "@historychannel",
      status: "CONNECTED" as const,
    };

    expect(socialConnectionItemSchema.safeParse(valid).success).toBeTruthy();
  });

  it("rejects connection object with invalid datetime string", () => {
    const invalid = {
      avatarUrl: null,
      connectedAt: "not-a-date",
      id: "conn_123",
      platform: "TIKTOK" as const,
      platformUserName: "@historychannel",
      status: "CONNECTED" as const,
    };

    expect(socialConnectionItemSchema.safeParse(invalid).success).toBeFalsy();
  });
});
