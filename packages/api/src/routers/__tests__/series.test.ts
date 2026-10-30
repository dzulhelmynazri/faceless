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

const createMockAutumn = (allowed = true) => {
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
      allowed,
      balance: { granted: 10, remaining: 5, usage: 5 },
    }),
  });

  return autumn;
};

const createTestContext = (
  db = createPrismaClient({ DATABASE_URL: "postgresql://localhost:5432/test" }),
  sessionUserId = "user_test_123",
  autumnInstance = new Autumn({ secretKey: "am_sk_test_key" })
): Context => ({
  auth: createTestAuth(),
  autumn: autumnInstance,
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

interface SeriesEntity {
  artStyleId: string;
  captionStyleId: string;
  createdAt: Date;
  customMusicKey: string | null;
  customMusicUrl: string | null;
  exampleScript: string | null;
  glitchEffect: boolean;
  id: string;
  language: string;
  musicTrackId: string | null;
  name: string;
  nichePresetId: string | null;
  nichePrompt: string;
  publishTime: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  tiktokSounds: string | null;
  updatedAt: Date;
  userId: string;
  videoDuration: string;
  voiceId: string;
}

interface SeriesListQueryItem extends SeriesEntity {
  _count: {
    episodes: number;
    socialAccounts: number;
  };
  socialAccounts: {
    socialConnection: {
      platform: "TIKTOK" | "YOUTUBE" | "INSTAGRAM";
    };
  }[];
}

interface SeriesDetailQueryItem extends SeriesEntity {
  episodes: {
    audioUrl: string | null;
    createdAt: Date;
    episodeNumber: number;
    id: string;
    publishedAt: Date | null;
    scenes: {
      duration: number;
      id: string;
      imageUrl: string;
      narrationText: string;
      sceneNumber: number;
      visualPrompt: string;
    }[];
    scheduledFor: Date | null;
    status:
      | "DRAFT"
      | "GENERATING"
      | "READY_FOR_REVIEW"
      | "APPROVED"
      | "RENDERING"
      | "PUBLISHING"
      | "PUBLISHED"
      | "FAILED";
    thumbnailUrl: string | null;
    title: string;
    topic: string;
    videoUrl: string | null;
  }[];
  socialAccounts: {
    id: string;
    socialConnection: {
      avatarUrl: string | null;
      platform: "TIKTOK" | "YOUTUBE" | "INSTAGRAM";
      platformUserName: string | null;
    };
    socialConnectionId: string;
  }[];
}

describe("seriesCoreRouter", () => {
  describe("create", () => {
    it("blocks series creation with FORBIDDEN when Autumn billing limit is reached", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

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
        value: vi
          .fn<() => Promise<AutumnCheckResponse>>()
          .mockResolvedValue({ allowed: false }),
      });

      const caller = createCaller(
        createTestContext(db, "user_test_123", autumn)
      );

      await expect(
        caller.series.create({
          artStyleId: "anime",
          captionStyleId: "default",
          name: "My New Series",
          nichePrompt: "Tech stories",
          voiceId: "voice_123",
        })
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message:
          "Active series limit reached. Upgrade your plan or add more series to create another.",
      });
    });

    it("creates a series and links connected social accounts when entitlement is allowed", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

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
          balance: { granted: 10, remaining: 5, usage: 5 },
        }),
      });

      const findManyConnectionsSpy = vi
        .fn<() => Promise<{ id: string }[]>>()
        .mockResolvedValue([{ id: "conn_1" }]);

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          findMany: findManyConnectionsSpy,
        },
      });

      const createSeriesSpy = vi
        .fn<() => Promise<{ id: string; name: string }>>()
        .mockResolvedValue({
          id: "series_new_123",
          name: "My New Series",
        });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          create: createSeriesSpy,
        },
      });

      const caller = createCaller(
        createTestContext(db, "user_test_123", autumn)
      );

      const result = await caller.series.create({
        artStyleId: "anime",
        captionStyleId: "default",
        name: "My New Series",
        nichePrompt: "Tech stories",
        socialConnectionIds: ["conn_1"],
        voiceId: "voice_123",
      });

      expect(result.success).toBeTruthy();
      expect(result.seriesId).toBe("series_new_123");
      expect(result.name).toBe("My New Series");

      expect(findManyConnectionsSpy).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          id: { in: ["conn_1"] },
          status: "CONNECTED",
          userId: "user_test_123",
        },
      });

      expect(createSeriesSpy).toHaveBeenCalledWith({
        data: {
          artStyleId: "anime",
          captionStyleId: "default",
          customMusicKey: undefined,
          customMusicUrl: undefined,
          exampleScript: undefined,
          glitchEffect: true,
          language: "en",
          musicTrackId: undefined,
          name: "My New Series",
          nichePresetId: undefined,
          nichePrompt: "Tech stories",
          publishTime: "12:00 PM",
          socialAccounts: {
            create: [{ socialConnectionId: "conn_1" }],
          },
          status: "ACTIVE",
          tiktokSounds: undefined,
          userId: "user_test_123",
          videoDuration: "30-40",
          voiceId: "voice_123",
        },
      });
    });

    it("links all connected accounts when socialConnectionIds contains __ALL__", async () => {
      const autumn = createMockAutumn(true);

      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const findManyConnectionsSpy = vi
        .fn<() => Promise<{ id: string }[]>>()
        .mockResolvedValue([{ id: "conn_1" }, { id: "conn_2" }]);

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          findMany: findManyConnectionsSpy,
        },
      });

      const createSeriesSpy = vi
        .fn<
          (params: {
            data: {
              socialAccounts?: {
                create?: { socialConnectionId: string }[];
              };
            };
          }) => Promise<{ id: string; name: string }>
        >()
        .mockResolvedValue({
          id: "series_all_123",
          name: "Broadcasting Series",
        });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          create: createSeriesSpy,
        },
      });

      const caller = createCaller(
        createTestContext(db, "user_test_123", autumn)
      );

      const result = await caller.series.create({
        artStyleId: "anime",
        captionStyleId: "default",
        name: "Broadcasting Series",
        nichePrompt: "Tech stories",
        socialConnectionIds: ["__ALL__"],
        voiceId: "voice_123",
      });

      expect(result.success).toBeTruthy();
      expect(findManyConnectionsSpy).toHaveBeenCalledWith({
        select: { id: true },
        where: {
          status: "CONNECTED",
          userId: "user_test_123",
        },
      });

      const createCall = createSeriesSpy.mock.calls[0]?.[0];

      expect(createCall?.data.socialAccounts?.create).toStrictEqual([
        { socialConnectionId: "conn_1" },
        { socialConnectionId: "conn_2" },
      ]);
    });

    it("skips social connection queries when socialConnectionIds is empty", async () => {
      const autumn = createMockAutumn(true);

      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const findManyConnectionsSpy = vi
        .fn<() => Promise<{ id: string }[]>>()
        .mockResolvedValue([]);

      Object.defineProperty(db, "socialConnection", {
        configurable: true,
        value: {
          findMany: findManyConnectionsSpy,
        },
      });

      const createSeriesSpy = vi
        .fn<
          (params: {
            data: {
              socialAccounts?: {
                create?: { socialConnectionId: string }[];
              };
            };
          }) => Promise<{ id: string; name: string }>
        >()
        .mockResolvedValue({
          id: "series_empty_123",
          name: "Standalone Series",
        });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          create: createSeriesSpy,
        },
      });

      const caller = createCaller(
        createTestContext(db, "user_test_123", autumn)
      );

      const result = await caller.series.create({
        artStyleId: "anime",
        captionStyleId: "default",
        name: "Standalone Series",
        nichePrompt: "Tech stories",
        socialConnectionIds: [],
        voiceId: "voice_123",
      });

      expect(result.success).toBeTruthy();
      expect(findManyConnectionsSpy).not.toHaveBeenCalled();

      const createCall = createSeriesSpy.mock.calls[0]?.[0];

      expect(createCall?.data.socialAccounts?.create).toStrictEqual([]);
    });
  });

  describe("list", () => {
    it("returns all series belonging to the authenticated tenant", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const now = new Date();

      const mockSeriesList: SeriesListQueryItem[] = [
        {
          _count: { episodes: 3, socialAccounts: 1 },
          artStyleId: "anime",
          captionStyleId: "default",
          createdAt: now,
          customMusicKey: null,
          customMusicUrl: null,
          exampleScript: null,
          glitchEffect: true,
          id: "series_1",
          language: "en",
          musicTrackId: null,
          name: "Series One",
          nichePresetId: null,
          nichePrompt: "Prompt one",
          publishTime: "12:00 PM",
          socialAccounts: [
            {
              socialConnection: {
                platform: "TIKTOK",
              },
            },
          ],
          status: "ACTIVE",
          tiktokSounds: null,
          updatedAt: now,
          userId: "user_test_123",
          videoDuration: "30-40",
          voiceId: "voice_1",
        },
      ];

      const findManySpy = vi
        .fn<() => Promise<SeriesListQueryItem[]>>()
        .mockResolvedValue(mockSeriesList);

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findMany: findManySpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));
      const result = await caller.series.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        episodeCount: 3,
        id: "series_1",
        name: "Series One",
        platforms: ["TIKTOK"],
        socialAccountCount: 1,
      });

      expect(findManySpy).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              episodes: true,
              socialAccounts: true,
            },
          },
          socialAccounts: {
            include: {
              socialConnection: {
                select: {
                  platform: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: "user_test_123",
        },
      });
    });
  });

  describe("byId", () => {
    it("rejects when series does not belong to session user", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const findFirstSpy = vi.fn<() => Promise<null>>().mockResolvedValue(null);

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: findFirstSpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_attacker"));

      await expect(
        caller.series.byId({ id: "series_private_123" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Series not found",
      });

      expect(findFirstSpy).toHaveBeenCalledWith({
        include: {
          episodes: {
            include: {
              scenes: {
                orderBy: {
                  sceneNumber: "asc",
                },
                select: {
                  duration: true,
                  id: true,
                  imageUrl: true,
                  narrationText: true,
                  sceneNumber: true,
                  visualPrompt: true,
                },
              },
            },
            orderBy: {
              episodeNumber: "asc",
            },
          },
          socialAccounts: {
            include: {
              socialConnection: {
                select: {
                  avatarUrl: true,
                  platform: true,
                  platformUserName: true,
                },
              },
            },
          },
        },
        where: {
          id: "series_private_123",
          userId: "user_attacker",
        },
      });
    });

    it("returns complete series hierarchy when owned by caller", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const now = new Date();

      const mockSeries: SeriesDetailQueryItem = {
        artStyleId: "anime",
        captionStyleId: "default",
        createdAt: now,
        customMusicKey: null,
        customMusicUrl: null,
        episodes: [
          {
            audioUrl: "https://example.com/audio.mp3",
            createdAt: now,
            episodeNumber: 1,
            id: "ep_1",
            publishedAt: null,
            scenes: [
              {
                duration: 5,
                id: "sc_1",
                imageUrl: "https://example.com/img.jpg",
                narrationText: "Hello world",
                sceneNumber: 1,
                visualPrompt: "Sunny day",
              },
            ],
            scheduledFor: null,
            status: "READY_FOR_REVIEW",
            thumbnailUrl: "https://example.com/thumb.jpg",
            title: "Episode 1",
            topic: "Intro",
            videoUrl: null,
          },
        ],
        exampleScript: null,
        glitchEffect: false,
        id: "series_owned_123",
        language: "en",
        musicTrackId: null,
        name: "Owned Series",
        nichePresetId: null,
        nichePrompt: "Niche description",
        publishTime: "12:00 PM",
        socialAccounts: [
          {
            id: "sa_1",
            socialConnection: {
              avatarUrl: null,
              platform: "TIKTOK",
              platformUserName: "@owned",
            },
            socialConnectionId: "conn_1",
          },
        ],
        status: "ACTIVE",
        tiktokSounds: null,
        updatedAt: now,
        userId: "user_test_123",
        videoDuration: "30-40",
        voiceId: "voice_1",
      };

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi
            .fn<() => Promise<SeriesDetailQueryItem>>()
            .mockResolvedValue(mockSeries),
        },
      });

      const caller = createCaller(createTestContext(db, "user_test_123"));
      const result = await caller.series.byId({ id: "series_owned_123" });

      expect(result.id).toBe("series_owned_123");
      expect(result.episodes).toHaveLength(1);
      expect(result.socialAccounts).toHaveLength(1);
      expect(result.socialAccounts[0]?.platform).toBe("TIKTOK");
    });
  });

  describe("updateStatus", () => {
    it("rejects cross-tenant status updates", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi.fn<() => Promise<null>>().mockResolvedValue(null),
        },
      });

      const caller = createCaller(createTestContext(db, "user_attacker"));

      await expect(
        caller.series.updateStatus({
          id: "series_victim",
          status: "PAUSED",
        })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Series not found",
      });
    });

    it("updates series status for verified owner", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const updateSpy = vi
        .fn<
          () => Promise<{
            id: string;
            status: "PAUSED";
          }>
        >()
        .mockResolvedValue({
          id: "series_1",
          status: "PAUSED",
        });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "series_1" }),
          update: updateSpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_owner"));

      const result = await caller.series.updateStatus({
        id: "series_1",
        status: "PAUSED",
      });

      expect(result.success).toBeTruthy();
      expect(result.status).toBe("PAUSED");
      expect(updateSpy).toHaveBeenCalledWith({
        data: { status: "PAUSED" },
        where: { id: "series_1" },
      });
    });
  });

  describe("update", () => {
    it("rejects cross-tenant series update", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi.fn<() => Promise<null>>().mockResolvedValue(null),
        },
      });

      const caller = createCaller(createTestContext(db, "user_attacker"));

      await expect(
        caller.series.update({
          id: "series_victim",
          name: "Hijacked Series Name",
        })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Series not found",
      });
    });

    it("updates series name and publish time for verified owner", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const updateSpy = vi
        .fn<() => Promise<{ id: string }>>()
        .mockResolvedValue({ id: "series_1" });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "series_1" }),
          update: updateSpy,
        },
      });

      const caller = createCaller(createTestContext(db, "user_owner"));

      const result = await caller.series.update({
        id: "series_1",
        name: "Renamed Series",
        publishTime: "06:00 PM",
      });

      expect(result.success).toBeTruthy();
      expect(result.id).toBe("series_1");
      expect(updateSpy).toHaveBeenCalledWith({
        data: {
          name: "Renamed Series",
          publishTime: "06:00 PM",
        },
        where: { id: "series_1" },
      });
    });
  });

  describe("delete", () => {
    it("rejects cross-tenant series deletion", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          findFirst: vi.fn<() => Promise<null>>().mockResolvedValue(null),
        },
      });

      const caller = createCaller(createTestContext(db, "user_attacker"));

      await expect(
        caller.series.delete({ id: "series_victim" })
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Series not found",
      });
    });

    it("deletes series for verified owner", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const deleteSpy = vi
        .fn<() => Promise<{ id: string }>>()
        .mockResolvedValue({ id: "series_1" });

      Object.defineProperty(db, "series", {
        configurable: true,
        value: {
          delete: deleteSpy,
          findFirst: vi
            .fn<() => Promise<{ id: string }>>()
            .mockResolvedValue({ id: "series_1" }),
        },
      });

      const caller = createCaller(createTestContext(db, "user_owner"));
      const result = await caller.series.delete({ id: "series_1" });

      expect(result.success).toBeTruthy();
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { id: "series_1" },
      });
    });
  });
});
