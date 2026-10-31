import { createTestAuth } from "@faceless/auth/test";
import { createPrismaClient } from "@faceless/db";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createSocialClient } from "@faceless/socials";
import { createFiles } from "@faceless/storage";
import { Autumn } from "autumn-js";
import { describe, expect, it, vi } from "vitest";

import type { Context } from "../../context";
import { createCallerFactory } from "../../trpc";
import { appRouter } from "../index";

interface AutumnCheckResponse {
  allowed: boolean;
  balance?: {
    granted: number;
    remaining: number;
    usage: number;
  };
}

const createTestContext = (
  autumnInstance: Autumn,
  sessionUserId = "user_test_123"
): Context => ({
  auth: createTestAuth(),
  autumn: autumnInstance,
  baseUrl: "http://localhost:3000",
  db: createPrismaClient({ DATABASE_URL: "postgresql://localhost:5432/test" }),
  files: createFiles({
    R2_ACCESS_KEY_ID: "test-key",
    R2_ACCOUNT_ID: "test-account",
    R2_BUCKET: "test-bucket",
    R2_PUBLIC_BASE_URL: "https://r2.example.com",
    R2_SECRET_ACCESS_KEY: "test-secret",
  }),
  session: {
    session: {
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86_400_000),
      id: "sess_test_123",
      token: "tok_test_abc",
      updatedAt: new Date(),
      userId: sessionUserId,
    },
    user: {
      createdAt: new Date(),
      email: "creator@faceless.video",
      emailVerified: true,
      id: sessionUserId,
      image: null,
      name: "Faceless Creator",
      updatedAt: new Date(),
    },
  },
  socials: createSocialClient({
    mockScenario: "immediate-text-success",
    provider: "mock",
  }),
  videoRenderer: new LocalRemotionRenderer({
    browserExecutable: "/usr/bin/chromium",
  }),
});

const createCaller = createCallerFactory(appRouter);

describe("billingRouter", () => {
  describe("checkSeriesEntitlement", () => {
    it("returns allowed with active counts when customer has remaining allowance", async () => {
      const autumn = new Autumn({ secretKey: "am_sk_test_key" });

      Object.defineProperty(autumn, "customers", {
        configurable: true,
        value: {
          getOrCreate: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "user_test_123" }),
        },
      });

      Object.defineProperty(autumn, "check", {
        configurable: true,
        value: vi.fn<() => Promise<AutumnCheckResponse>>().mockResolvedValue({
          allowed: true,
          balance: { granted: 10, remaining: 6, usage: 4 },
        }),
      });

      const caller = createCaller(createTestContext(autumn, "user_test_123"));
      const result = await caller.billing.checkSeriesEntitlement();

      expect(result).toStrictEqual({
        allowed: true,
        seriesCount: 4,
        seriesLimit: 10,
      });
    });

    it("returns disallowed and zeroes for missing balance information", async () => {
      const autumn = new Autumn({ secretKey: "am_sk_test_key" });

      Object.defineProperty(autumn, "customers", {
        configurable: true,
        value: {
          getOrCreate: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "user_test_123" }),
        },
      });

      Object.defineProperty(autumn, "check", {
        configurable: true,
        value: vi.fn<() => Promise<AutumnCheckResponse>>().mockResolvedValue({
          allowed: false,
        }),
      });

      const caller = createCaller(createTestContext(autumn, "user_test_123"));
      const result = await caller.billing.checkSeriesEntitlement();

      expect(result).toStrictEqual({
        allowed: false,
        seriesCount: 0,
        seriesLimit: 0,
      });
    });
  });
});
