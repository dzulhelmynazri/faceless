import { createTestAuth } from "@faceless/auth/test";
import { createPrismaClient } from "@faceless/db";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createSocialClient } from "@faceless/socials";
import { createFiles } from "@faceless/storage";
import { TRPCError } from "@trpc/server";
import { Autumn } from "autumn-js";
import { describe, expect, it, vi } from "vitest";

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

describe("episodesRouter - updateEpisodeScene", () => {
  it("rejects cross-tenant updates when episode does not belong to session user", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const findFirstMock = vi.fn<() => Promise<null>>().mockResolvedValue(null);

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: findFirstMock,
      },
    });

    const caller = createCaller(createTestContext(db, "user_attacker"));

    await expect(
      caller.series.updateEpisodeScene({
        episodeId: "ep_victim",
        narrationText: "Hacked narration",
        sceneNumber: 1,
      })
    ).rejects.toThrow(TRPCError);

    expect(findFirstMock).toHaveBeenCalledWith({
      include: {
        scenes: {
          where: { sceneNumber: 1 },
        },
      },
      where: {
        id: "ep_victim",
        series: {
          userId: "user_attacker",
        },
      },
    });
  });

  it("updates visual prompt only without triggering script rebuild", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const sceneUpdateSpy = vi
      .fn<
        () => Promise<{
          duration: number;
          id: string;
          imageUrl: string;
          narrationText: string;
          sceneNumber: number;
          visualPrompt: string;
        }>
      >()
      .mockResolvedValue({
        duration: 5,
        id: "scene_1",
        imageUrl: "https://example.com/scene1.jpg",
        narrationText: "Unchanged narration text.",
        sceneNumber: 1,
        visualPrompt: "Updated visual prompt only",
      });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<
            () => Promise<{
              id: string;
              scenes: { id: string; sceneNumber: number }[];
            }>
          >()
          .mockResolvedValue({
            id: "ep_123",
            scenes: [{ id: "scene_1", sceneNumber: 1 }],
          }),
        update: vi.fn<() => void>(),
      },
    });

    Object.defineProperty(db, "seriesEpisodeScene", {
      configurable: true,
      value: {
        findMany: vi.fn<() => void>(),
        update: sceneUpdateSpy,
      },
    });

    const caller = createCaller(createTestContext(db, "user_owner"));

    const result = await caller.series.updateEpisodeScene({
      episodeId: "ep_123",
      sceneNumber: 1,
      visualPrompt: "Updated visual prompt only",
    });

    expect(result.success).toBeTruthy();
    expect(result.updatedScript).toBeUndefined();
    expect(sceneUpdateSpy).toHaveBeenCalledWith({
      data: {
        narrationText: undefined,
        visualPrompt: "Updated visual prompt only",
      },
      select: {
        duration: true,
        id: true,
        imageUrl: true,
        narrationText: true,
        sceneNumber: true,
        visualPrompt: true,
      },
      where: {
        episodeId_sceneNumber: {
          episodeId: "ep_123",
          sceneNumber: 1,
        },
      },
    });
  });

  it("updates narration text and rebuilds episode script", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const episodeUpdateSpy = vi
      .fn<() => Promise<{ id: string }>>()
      .mockResolvedValue({ id: "ep_123" });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<
            () => Promise<{
              id: string;
              scenes: { id: string; sceneNumber: number }[];
            }>
          >()
          .mockResolvedValue({
            id: "ep_123",
            scenes: [{ id: "scene_1", sceneNumber: 1 }],
          }),
        update: episodeUpdateSpy,
      },
    });

    Object.defineProperty(db, "seriesEpisodeScene", {
      configurable: true,
      value: {
        findMany: vi
          .fn<() => Promise<{ narrationText: string }[]>>()
          .mockResolvedValue([
            { narrationText: "New scene 1 narration." },
            { narrationText: "Scene 2 narration." },
          ]),
        update: vi
          .fn<
            () => Promise<{
              duration: number;
              id: string;
              imageUrl: string;
              narrationText: string;
              sceneNumber: number;
              visualPrompt: string;
            }>
          >()
          .mockResolvedValue({
            duration: 5,
            id: "scene_1",
            imageUrl: "https://example.com/scene1.jpg",
            narrationText: "New scene 1 narration.",
            sceneNumber: 1,
            visualPrompt: "Visual prompt",
          }),
      },
    });

    const caller = createCaller(createTestContext(db, "user_owner"));

    const result = await caller.series.updateEpisodeScene({
      episodeId: "ep_123",
      narrationText: "New scene 1 narration.",
      sceneNumber: 1,
    });

    expect(result.success).toBeTruthy();
    expect(result.updatedScript).toBe(
      "New scene 1 narration.\n\nScene 2 narration."
    );

    expect(episodeUpdateSpy).toHaveBeenCalledWith({
      data: {
        script: "New scene 1 narration.\n\nScene 2 narration.",
      },
      where: { id: "ep_123" },
    });
  });
});
