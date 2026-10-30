import { describe, expect, it } from "vitest";

import {
  PLATFORM_TO_SDK_MAP,
  SDK_TO_PLATFORM_MAP,
  getOAuthUrlInputSchema,
  getOAuthUrlOutputSchema,
  oauthCallbackQuerySchema,
  oauthInitiateQuerySchema,
  socialConnectionItemSchema,
  socialPlatformParamSchema,
  socialPlatformSchema,
  targetOutcomeStateSchema,
  tikTokPrivacyLevelSchema,
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

describe("SDK and Platform bi-directional mappings", () => {
  it("provides symmetrical mapping between SDK names and uppercase platform enums", () => {
    expect(SDK_TO_PLATFORM_MAP.tiktok).toBe("TIKTOK");
    expect(SDK_TO_PLATFORM_MAP.youtube).toBe("YOUTUBE");
    expect(SDK_TO_PLATFORM_MAP.instagram).toBe("INSTAGRAM");
    expect(PLATFORM_TO_SDK_MAP.TIKTOK).toBe("tiktok");
    expect(PLATFORM_TO_SDK_MAP.YOUTUBE).toBe("youtube");
  });
});

describe("oauthInitiateQuerySchema contract", () => {
  it("accepts valid redirect URI and state parameter", () => {
    const valid = {
      redirect_uri: "https://faceless.video/callback",
      state: "state_nonce_123",
    };

    const parsed = oauthInitiateQuerySchema.safeParse(valid);

    expect(parsed.success).toBeTruthy();
  });

  it("rejects when required state parameter is empty", () => {
    const invalid = {
      redirect_uri: "https://faceless.video/callback",
      state: "",
    };

    const parsed = oauthInitiateQuerySchema.safeParse(invalid);

    expect(parsed.success).toBeFalsy();
  });
});

describe("getOAuthUrlInputSchema & getOAuthUrlOutputSchema contracts", () => {
  it("validates getOAuthUrl input and output with valid URL string", () => {
    const input = {
      platform: "YOUTUBE" as const,
      redirectUri: "https://faceless.video/auth/youtube",
    };

    const parsedInput = getOAuthUrlInputSchema.safeParse(input);

    expect(parsedInput.success).toBeTruthy();

    const output = {
      url: "https://accounts.google.com/o/oauth2/v2/auth?scope=youtube",
    };

    const parsedOutput = getOAuthUrlOutputSchema.safeParse(output);

    expect(parsedOutput.success).toBeTruthy();
  });

  it("rejects output when url is not a valid absolute URL", () => {
    const invalid = {
      url: "invalid-url-path",
    };

    const parsed = getOAuthUrlOutputSchema.safeParse(invalid);

    expect(parsed.success).toBeFalsy();
  });
});

describe("tikTokPrivacyLevelSchema & targetOutcomeStateSchema contracts", () => {
  it("validates supported TikTok privacy levels", () => {
    expect(
      tikTokPrivacyLevelSchema.safeParse("PUBLIC_TO_EVERYONE").success
    ).toBeTruthy();
    expect(
      tikTokPrivacyLevelSchema.safeParse("SELF_ONLY").success
    ).toBeTruthy();
    expect(
      tikTokPrivacyLevelSchema.safeParse("FRIENDS_ONLY").success
    ).toBeFalsy();
  });

  it("validates publication target outcome states", () => {
    expect(
      targetOutcomeStateSchema.safeParse("published").success
    ).toBeTruthy();
    expect(
      targetOutcomeStateSchema.safeParse("processing").success
    ).toBeTruthy();
    expect(targetOutcomeStateSchema.safeParse("failed").success).toBeTruthy();
    expect(
      targetOutcomeStateSchema.safeParse("unrecognized_state").success
    ).toBeFalsy();
  });
});
