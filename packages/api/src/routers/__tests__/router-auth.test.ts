import { createTestAuth } from "@faceless/auth/test";
import { createPrismaClient } from "@faceless/db";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createSocialClient } from "@faceless/socials";
import { createFiles } from "@faceless/storage";
import { TRPCError } from "@trpc/server";
import { Autumn } from "autumn-js";
import { describe, expect, it } from "vitest";

import type { Context } from "../../context";
import { createCallerFactory } from "../../trpc";
import { appRouter } from "../index";

const createTestContext = (session: Context["session"] = null): Context => ({
  auth: createTestAuth(),
  autumn: new Autumn({ secretKey: "am_sk_test_key" }),
  baseUrl: "http://localhost:3000",
  db: createPrismaClient({
    DATABASE_URL: "postgresql://localhost:5432/test",
  }),
  files: createFiles({
    R2_ACCESS_KEY_ID: "test-key",
    R2_ACCOUNT_ID: "test-account",
    R2_BUCKET: "test-bucket",
    R2_PUBLIC_BASE_URL: "https://r2.example.com",
    R2_SECRET_ACCESS_KEY: "test-secret",
  }),
  session,
  socials: createSocialClient({
    mockScenario: "immediate-text-success",
    provider: "mock",
  }),
  videoRenderer: new LocalRemotionRenderer({
    browserExecutable: "/usr/bin/chromium",
  }),
});

const createCaller = createCallerFactory(appRouter);

describe("tRPC Router Auth Protection", () => {
  it("allows unauthenticated callers to access public procedures", async () => {
    const unauthCaller = createCaller(createTestContext(null));
    const result = await unauthCaller.healthCheck();

    expect(result).toBe("OK");
  });

  it("blocks unauthenticated callers from protected procedures with UNAUTHORIZED", async () => {
    const unauthCaller = createCaller(createTestContext(null));

    await expect(unauthCaller.privateData()).rejects.toThrow(TRPCError);
    await expect(unauthCaller.privateData()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  });

  it("allows authenticated callers with Better Auth session to access protected procedures", async () => {
    const auth = createTestAuth();
    const authCtx = await auth.$context;

    const user = authCtx.test.createUser({
      email: "creator@faceless.video",
      name: "Faceless Creator",
    });

    const authenticatedSession = {
      session: {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
        id: "sess_test_123",
        token: "tok_test_abc",
        updatedAt: new Date(),
        userId: user.id,
      },
      user,
    };

    const authCaller = createCaller(createTestContext(authenticatedSession));
    const result = await authCaller.privateData();

    expect(result).toStrictEqual({
      message: "This is private",
      user,
    });
  });
});
