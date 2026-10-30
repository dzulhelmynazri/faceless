import { createTestAuth } from "@faceless/auth/test";
import { createPrismaClient } from "@faceless/db";
import type {
  RenderVideoParams,
  RenderVideoResult,
  VideoRendererService,
} from "@faceless/remotion/server";
import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createSocialClient } from "@faceless/socials";
import { createFiles } from "@faceless/storage";
import { TRPCError } from "@trpc/server";
import { Autumn } from "autumn-js";
import { describe, expect, it, vi } from "vitest";

import type { Context } from "../../context";
import { createCallerFactory } from "../../trpc";
import { appRouter } from "../index";

const mockScriptPayload = {
  fullNarration:
    "In a world where technology and imagination merge, stories come to life in seconds. Every creator has the power to build incredible worlds without limits.",
  hook: "Did you know that computers can now dream in video?",
  reasoning: "High engagement hook with emotional appeal",
  scenes: [
    {
      estimatedSeconds: 4,
      narrationChunk: "In a world where technology and imagination merge,",
      sceneNumber: 1,
      visualPrompt: "Futuristic digital landscape with glowing connections",
    },
    {
      estimatedSeconds: 4,
      narrationChunk: "stories come to life in seconds.",
      sceneNumber: 2,
      visualPrompt: "Vibrant animated characters emerging from light",
    },
    {
      estimatedSeconds: 4,
      narrationChunk:
        "Every creator has the power to build incredible worlds without limits.",
      sceneNumber: 3,
      visualPrompt: "A solitary creator watching cosmic landscapes unfold",
    },
  ],
  targetDurationSeconds: 12,
  title: "The Future of Creation",
  viralityScore: 9,
};

const mockAudioMetadata = {
  audioDuration: 12,
  audioKey: "audio_123.mp3",
  characterCount: 150,
  generationCostUsd: 0.002,
  modelId: "eleven_turbo_v2_5",
  voiceId: "voice_en_1",
  wordTimestamps: [
    { cleanWord: "in", end: 1, start: 0, word: "In" },
    { cleanWord: "a", end: 2, start: 1, word: "a" },
    { cleanWord: "world", end: 3, start: 2, word: "world" },
  ],
};

const createTestContext = (
  db = createPrismaClient({ DATABASE_URL: "postgresql://localhost:5432/test" }),
  sessionUserId = "user_test_123",
  videoRenderer: VideoRendererService = new LocalRemotionRenderer()
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
  videoRenderer,
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
        narrationText: "Scene 1 narration.",
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
      },
    });

    Object.defineProperty(db, "seriesEpisodeScene", {
      configurable: true,
      value: {
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

describe("episodesRouter - getEpisodeById", () => {
  it("rejects with NOT_FOUND when episode is missing or belongs to another user", async () => {
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

    const caller = createCaller(createTestContext(db, "user_test_123"));

    await expect(
      caller.series.getEpisodeById({ episodeId: "ep_unknown" })
    ).rejects.toThrow(TRPCError);

    expect(findFirstMock).toHaveBeenCalledWith({
      include: {
        scenes: {
          orderBy: { sceneNumber: "asc" },
          select: {
            duration: true,
            id: true,
            imageUrl: true,
            narrationText: true,
            sceneNumber: true,
            visualPrompt: true,
          },
        },
        series: {
          select: {
            captionStyleId: true,
            customMusicUrl: true,
            glitchEffect: true,
            id: true,
            musicTrackId: true,
            name: true,
            voiceId: true,
          },
        },
      },
      where: {
        id: "ep_unknown",
        series: {
          userId: "user_test_123",
        },
      },
    });
  });

  it("returns formatted episode, series configuration, and scenes for the owner", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const mockDate = new Date("2026-10-30T12:00:00Z");

    const mockEpisode = {
      audioUrl: "https://r2.faceless.video/audio.mp3",
      createdAt: mockDate,
      episodeNumber: 1,
      error: null,
      id: "ep_123",
      metadata: {
        audio: mockAudioMetadata,
        script: mockScriptPayload,
      },
      scenes: [
        {
          duration: 4,
          id: "sc_1",
          imageUrl: "https://r2.faceless.video/sc1.png",
          narrationText: "Once upon a time",
          sceneNumber: 1,
          visualPrompt: "Castle at sunrise",
        },
      ],
      script: "Once upon a time",
      series: {
        captionStyleId: "bold-stroke",
        customMusicUrl: null,
        glitchEffect: false,
        id: "series_456",
        musicTrackId: null,
        name: "My Story Series",
        voiceId: "voice_en_1",
      },
      seriesId: "series_456",
      status: "READY_FOR_REVIEW" as const,
      thumbnailUrl: "https://r2.faceless.video/thumb.png",
      title: "The Beginning",
      topic: "Fantasy",
      updatedAt: mockDate,
      videoUrl: null,
    };

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<() => Promise<typeof mockEpisode>>()
          .mockResolvedValue(mockEpisode),
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));
    const result = await caller.series.getEpisodeById({ episodeId: "ep_123" });

    expect(result.episode.id).toBe("ep_123");
    expect(result.episode.status).toBe("READY_FOR_REVIEW");
    expect(result.episode.createdAt).toBe(mockDate.toISOString());
    expect(result.series.captionStyleId).toBe("bold-stroke");
    expect(result.scenes[0]?.sceneNumber).toBe(1);
  });
});

describe("episodesRouter - updateEpisodeCustomization", () => {
  it("rejects with NOT_FOUND when episode is missing or belongs to another user", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi.fn<() => Promise<null>>().mockResolvedValue(null),
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));

    await expect(
      caller.series.updateEpisodeCustomization({
        customization: {
          bgmUrl: null,
          captionStyleId: "karaoke",
          glitchEffect: true,
        },
        episodeId: "ep_cross_tenant",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("rejects with BAD_REQUEST when episode metadata is missing", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<() => Promise<{ id: string; metadata: null }>>()
          .mockResolvedValue({ id: "ep_123", metadata: null }),
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));

    await expect(
      caller.series.updateEpisodeCustomization({
        customization: {
          bgmUrl: null,
          captionStyleId: "karaoke",
          glitchEffect: true,
        },
        episodeId: "ep_123",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("merges customization settings into existing metadata", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const existingMetadata = {
      script: mockScriptPayload,
    };

    const updateSpy = vi
      .fn<() => Promise<{ id: string }>>()
      .mockResolvedValue({ id: "ep_123" });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<
            () => Promise<{ id: string; metadata: typeof existingMetadata }>
          >()
          .mockResolvedValue({
            id: "ep_123",
            metadata: existingMetadata,
          }),
        update: updateSpy,
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));

    const result = await caller.series.updateEpisodeCustomization({
      customization: {
        bgmUrl: "https://r2.faceless.video/bgm.mp3",
        captionStyleId: "majestic",
        glitchEffect: true,
      },
      episodeId: "ep_123",
    });

    expect(result.success).toBeTruthy();
    expect(result.customization.captionStyleId).toBe("majestic");
    expect(updateSpy).toHaveBeenCalledWith({
      data: {
        metadata: {
          ...existingMetadata,
          customization: {
            bgmUrl: "https://r2.faceless.video/bgm.mp3",
            captionStyleId: "majestic",
            glitchEffect: true,
          },
        },
      },
      where: { id: "ep_123" },
    });
  });
});

describe("episodesRouter - updateEpisodeStatus", () => {
  it("rejects with NOT_FOUND when episode does not exist for session user", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi.fn<() => Promise<null>>().mockResolvedValue(null),
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));

    await expect(
      caller.series.updateEpisodeStatus({
        episodeId: "ep_missing",
        status: "APPROVED",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("triggers renderEpisodeVideo when transitioning to APPROVED without existing videoUrl", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const mockEpisode = {
      audioUrl: "https://r2.faceless.video/audio.mp3",
      id: "ep_123",
      metadata: {
        audio: mockAudioMetadata,
        script: mockScriptPayload,
      },
      scenes: [
        {
          duration: 4,
          id: "sc_1",
          imageUrl: "https://r2.faceless.video/img.png",
          narrationText: "Hello",
          sceneNumber: 1,
          visualPrompt: "Futuristic digital landscape",
        },
      ],
      scheduledFor: null,
      series: {
        captionStyleId: "bold-stroke",
        customMusicUrl: null,
        glitchEffect: false,
        musicTrackId: null,
        publishTime: "02:00 PM",
        userId: "user_test_123",
      },
      seriesId: "series_456",
      status: "READY_FOR_REVIEW" as const,
      videoUrl: null,
    };

    const updateSpy = vi
      .fn<() => Promise<typeof mockEpisode>>()
      .mockResolvedValue(mockEpisode);

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<() => Promise<typeof mockEpisode>>()
          .mockResolvedValue(mockEpisode),
        update: updateSpy,
      },
    });

    const mockRenderer: VideoRendererService = {
      renderVideo: vi
        .fn<(params: RenderVideoParams) => Promise<RenderVideoResult>>()
        .mockResolvedValue({
          renderDurationMs: 500,
          status: "submitted",
        }),
    };

    const caller = createCaller(
      createTestContext(db, "user_test_123", mockRenderer)
    );

    const result = await caller.series.updateEpisodeStatus({
      episodeId: "ep_123",
      status: "APPROVED",
    });

    expect(result.success).toBeTruthy();
    expect(result.status).toBe("RENDERING");
    expect(mockRenderer.renderVideo).toHaveBeenCalledOnce();
  });

  it("updates status directly and computes scheduledFor when video is already rendered", async () => {
    const db = createPrismaClient({
      DATABASE_URL: "postgresql://localhost:5432/test",
    });

    const mockEpisode = {
      id: "ep_123",
      scheduledFor: null,
      series: {
        publishTime: "02:00 PM",
        userId: "user_test_123",
      },
      seriesId: "series_456",
      status: "READY_FOR_REVIEW" as const,
      videoUrl: "https://r2.faceless.video/rendered.mp4",
    };

    const updateSpy = vi
      .fn<
        (params: {
          data: {
            error?: string | null;
            scheduledFor?: Date;
            status: "APPROVED";
          };
          where: { id: string };
        }) => Promise<{ status: "APPROVED" }>
      >()
      .mockResolvedValue({ status: "APPROVED" });

    Object.defineProperty(db, "seriesEpisode", {
      configurable: true,
      value: {
        findFirst: vi
          .fn<() => Promise<typeof mockEpisode>>()
          .mockResolvedValue(mockEpisode),
        update: updateSpy,
      },
    });

    const caller = createCaller(createTestContext(db, "user_test_123"));

    const result = await caller.series.updateEpisodeStatus({
      episodeId: "ep_123",
      status: "APPROVED",
    });

    expect(result.success).toBeTruthy();
    expect(result.status).toBe("APPROVED");

    const updateCall = updateSpy.mock.calls[0]?.[0];
    expect(updateCall?.where).toStrictEqual({ id: "ep_123" });
    expect(updateCall?.data.status).toBe("APPROVED");
    expect(updateCall?.data.scheduledFor).toBeInstanceOf(Date);
  });
});
