import { createTestAuth } from "@faceless/auth/test";
import { createPrismaClient } from "@faceless/db";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createSocialClient } from "@faceless/socials";
import { createFiles } from "@faceless/storage";
import { Autumn } from "autumn-js";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { Context } from "../../context";
import { createCallerFactory } from "../../trpc";
import { appRouter } from "../index";

const createTestContext = (
  db = createPrismaClient({ DATABASE_URL: "postgresql://localhost:5432/test" }),
  sessionUserId = "user_test_123"
): Context => ({
  auth: createTestAuth(),
  autumn: new Autumn({ secretKey: "am_sk_test_key" }),
  baseUrl: "http://localhost:3000",
  db,
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
  videoRenderer: new LocalRemotionRenderer(),
});

const createCaller = createCallerFactory(appRouter);

interface SocialConnectionEntity {
  avatarUrl: string | null;
  createdAt: Date;
  id: string;
  platform: "TIKTOK" | "YOUTUBE" | "INSTAGRAM";
  platformUserName: string | null;
  status: "CONNECTED" | "DISCONNECTED" | "EXPIRED";
}

describe("socialRouter", () => {
  describe("getConnections", () => {
    it("returns active connected platforms for session user in descending order", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const now = new Date();

      const mockConnections: SocialConnectionEntity[] = [
        {
          avatarUrl: "https://example.com/avatar.jpg",
          createdAt: now,
          id: "conn_1",
          platform: "TIKTOK",
          platformUserName: "@test_creator",
          status: "CONNECTED",
        },
      ];

      const findManySpy = vi
        .fn<() => Promise<SocialConnectionEntity[]>>()
        .mockResolvedValue(mockConnections);

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          findMany: findManySpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));
      const result = await caller.social.getConnections();

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual({
        avatarUrl: "https://example.com/avatar.jpg",
        connectedAt: now.toISOString(),
        id: "conn_1",
        platform: "TIKTOK",
        platformUserName: "@test_creator",
        status: "CONNECTED",
      });

      expect(findManySpy).toHaveBeenCalledWith({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          avatarUrl: true,
          createdAt: true,
          id: true,
          platform: true,
          platformUserName: true,
          status: true,
        },
        where: {
          status: "CONNECTED",
          userId: "user_test_123",
        },
      });
    });
  });

  describe("disconnect", () => {
    it("rejects when no active connection exists for the tenant and platform", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const findFirstSpy = vi.fn<() => Promise<null>>().mockResolvedValue(null);

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          findFirst: findFirstSpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));

      await expect(
        caller.social.disconnect({ platform: "TIKTOK" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "No active connection found for TIKTOK",
      });

      expect(findFirstSpy).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          platform: "TIKTOK",
          userId: "user_test_123",
        },
      });
    });

    it("deletes connection record when owned by session user", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const deleteSpy = vi
        .fn<() => Promise<{ id: string }>>()
        .mockResolvedValue({ id: "conn_1" });

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          delete: deleteSpy,
          findFirst: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "conn_1" }),
        },
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));
      const result = await caller.social.disconnect({ platform: "TIKTOK" });

      expect(result.success).toBeTruthy();
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: "conn_1" },
      });
    });
  });

  describe("getOAuthUrl", () => {
    it("generates correct OAuth redirect URL with encoded state and redirect_uri", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));

      const result = await caller.social.getOAuthUrl({
        platform: "YOUTUBE",
        redirectUri: "http://localhost:3000/settings/social",
      });

      expect(result.url).toContain("/api/social/oauth/youtube?");
      expect(result.url).toContain(
        "redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fsettings%2Fsocial"
      );
      expect(result.url).toContain("state=");
    });

    it("encodes valid platform metadata and timestamp inside the OAuth state parameter", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));

      const result = await caller.social.getOAuthUrl({
        platform: "INSTAGRAM",
        redirectUri: "http://localhost:3000/dashboard/socials",
      });

      const parsedUrl = new URL(result.url);
      const stateParam = parsedUrl.searchParams.get("state");

      const stateSchema = z.object({
        platform: z.literal("INSTAGRAM"),
        ts: z.number(),
      });

      const decoded = decodeURIComponent(stateParam ?? "");
      const parsedJson: unknown = JSON.parse(decoded);
      const parsedState = stateSchema.safeParse(parsedJson);

      expect(parsedState.success).toBeTruthy();
    });
  });
});
