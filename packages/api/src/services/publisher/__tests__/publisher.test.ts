import type { SocialConnection } from "@faceless/db";
import { createPrismaClient } from "@faceless/db";
import { createSocialClient } from "@faceless/socials";
import { describe, expect, it, vi } from "vitest";

import { buildTargetForPlatform, publishEpisodeToSocials } from "../index";

const createMockConnection = (
  platform: SocialConnection["platform"],
  platformUserId = "user_123"
): SocialConnection => ({
  avatarUrl: null,
  createdAt: new Date(),
  id: "conn_123",
  platform,
  platformUserId,
  platformUserName: "Test Creator",
  status: "CONNECTED",
  updatedAt: new Date(),
  userId: "usr_abc",
});

const createMockEpisodeWithSeries = (
  userId = "user_alice",
  status:
    | "APPROVED"
    | "PUBLISHED"
    | "PUBLISHING"
    | "FAILED"
    | "PENDING" = "APPROVED",
  videoUrl: string | null = "https://storage.example.com/videos/alice1.mp4",
  socialAccounts: { socialConnection: SocialConnection }[] = [
    { socialConnection: createMockConnection("TIKTOK", "tt_alice_1") },
  ]
) => ({
  audioUrl: "https://storage.example.com/audio/alice1.mp3",
  createdAt: new Date(),
  episodeNumber: 1,
  error: null,
  id: "ep_alice_1",
  metadata: null,
  publishedAt: null,
  scheduledFor: null,
  script: "Script narration chunk",
  series: {
    artStyleId: "anime",
    captionStyleId: "default",
    createdAt: new Date(),
    customMusicKey: null,
    customMusicUrl: null,
    exampleScript: null,
    glitchEffect: true,
    id: "series_alice_1",
    language: "en",
    musicTrackId: null,
    name: "Alice Channel",
    nichePresetId: null,
    nichePrompt: "Tech stories",
    publishTime: "12:00 PM",
    socialAccounts: socialAccounts.map((sa, idx) => ({
      createdAt: new Date(),
      id: `sa_${idx}`,
      seriesId: "series_alice_1",
      socialConnection: sa.socialConnection,
      socialConnectionId: sa.socialConnection.id,
    })),
    status: "ACTIVE" as const,
    tiktokSounds: null,
    updatedAt: new Date(),
    userId,
    videoDuration: "30-40",
    voiceId: "voice_1",
  },
  seriesId: "series_alice_1",
  status,
  thumbnailUrl: "https://storage.example.com/thumbs/alice1.jpg",
  title: "Episode One",
  topic: "Technology",
  updatedAt: new Date(),
  videoUrl,
});

describe("Publisher Module", () => {
  describe(buildTargetForPlatform, () => {
    it("correctly maps YOUTUBE connection to public youtube target", () => {
      const conn = createMockConnection("YOUTUBE", "yt_channel_456");
      const target = buildTargetForPlatform(conn);

      expect(target).toStrictEqual({
        accountId: "yt_channel_456",
        madeForKids: false,
        platform: "youtube",
        visibility: "public",
      });
    });

    it("correctly maps TIKTOK connection with consent and AI generation disclosure", () => {
      const conn = createMockConnection("TIKTOK", "tt_user_789");
      const target = buildTargetForPlatform(conn);

      expect(target).toStrictEqual({
        accountId: "tt_user_789",
        aiGenerated: true,
        brandedContent: false,
        consentGiven: true,
        disableComments: false,
        disableDuet: false,
        disableStitch: false,
        isDraft: false,
        ownBrand: false,
        platform: "tiktok",
        privacy: "PUBLIC_TO_EVERYONE",
      });
    });

    it("correctly maps INSTAGRAM connection with feed sharing enabled", () => {
      const conn = createMockConnection("INSTAGRAM", "ig_page_321");
      const target = buildTargetForPlatform(conn);

      expect(target).toStrictEqual({
        accountId: "ig_page_321",
        platform: "instagram",
        shareToFeed: true,
      });
    });
  });

  describe(publishEpisodeToSocials, () => {
    it("rejects cross-tenant access when episode does not belong to user", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const findFirstSpy = vi
        .spyOn(db.seriesEpisode, "findFirst")
        .mockResolvedValue(null);

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_bob",
        })
      ).rejects.toThrow("Episode not found or access denied");

      expect(findFirstSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "ep_alice_1",
            series: {
              userId: "user_bob",
            },
          },
        })
      );
    });

    it("allows authorized tenant to publish their own episode successfully", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const mockEpisode = createMockEpisodeWithSeries("user_alice");

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);
      vi.spyOn(db.seriesEpisode, "updateMany").mockResolvedValue({ count: 1 });
      vi.spyOn(db.seriesEpisode, "update").mockResolvedValue(mockEpisode);
      vi.spyOn(db.socialPublication, "createMany").mockResolvedValue({
        count: 1,
      });

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      const result = await publishEpisodeToSocials({
        db,
        episodeId: "ep_alice_1",
        socials,
        userId: "user_alice",
      });

      expect(result.success).toBeTruthy();
      expect(result.status).toBe("PUBLISHED");
      expect(result.outcomes).toHaveLength(1);
    });

    it("rejects publication when episode is already published", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const mockEpisode = createMockEpisodeWithSeries(
        "user_alice",
        "PUBLISHED"
      );

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_alice",
        })
      ).rejects.toThrow("Episode is already published");
    });

    it("rejects publication when episode does not have a video URL", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const mockEpisode = createMockEpisodeWithSeries(
        "user_alice",
        "APPROVED",
        null
      );

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_alice",
        })
      ).rejects.toThrow(
        "Cannot publish episode without a pre-rendered video URL"
      );
    });

    it("rejects publication when series has no active connected social accounts", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const disconnectedConn: SocialConnection = {
        ...createMockConnection("TIKTOK", "tt_expired_1"),
        status: "EXPIRED",
      };

      const mockEpisode = createMockEpisodeWithSeries(
        "user_alice",
        "APPROVED",
        "https://storage.example.com/videos/alice1.mp4",
        [{ socialConnection: disconnectedConn }]
      );

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_alice",
        })
      ).rejects.toThrow(
        "No connected social media accounts found for this series"
      );
    });

    it("rejects concurrent publication when episode is locked in PUBLISHING state", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const mockEpisode = createMockEpisodeWithSeries(
        "user_alice",
        "PUBLISHING"
      );

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);
      // Concurrent update lock failed because status is already PUBLISHING
      vi.spyOn(db.seriesEpisode, "updateMany").mockResolvedValue({ count: 0 });

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_alice",
        })
      ).rejects.toThrow("Episode is already being published");
    });

    it("rejects publication when episode is in an invalid state such as PENDING", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const mockEpisode = createMockEpisodeWithSeries("user_alice", "PENDING");

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(mockEpisode);
      // Status is PENDING so atomic claim matching APPROVED | FAILED yields 0
      vi.spyOn(db.seriesEpisode, "updateMany").mockResolvedValue({ count: 0 });

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      await expect(
        publishEpisodeToSocials({
          db,
          episodeId: "ep_alice_1",
          socials,
          userId: "user_alice",
        })
      ).rejects.toThrow(
        "Episode cannot be published in its current state (PENDING)"
      );
    });

    it("publishes across multiple connected platforms (TikTok, YouTube, Instagram)", async () => {
      const db = createPrismaClient({
        DATABASE_URL: "postgresql://localhost:5432/test",
      });

      const multiPlatformEpisode = createMockEpisodeWithSeries(
        "user_alice",
        "APPROVED",
        "https://storage.example.com/videos/alice1.mp4",
        [
          { socialConnection: createMockConnection("TIKTOK", "tt_alice_1") },
          { socialConnection: createMockConnection("YOUTUBE", "yt_alice_1") },
          { socialConnection: createMockConnection("INSTAGRAM", "ig_alice_1") },
        ]
      );

      vi.spyOn(db.seriesEpisode, "findFirst").mockResolvedValue(
        multiPlatformEpisode
      );
      vi.spyOn(db.seriesEpisode, "updateMany").mockResolvedValue({ count: 1 });
      vi.spyOn(db.seriesEpisode, "update").mockResolvedValue(
        multiPlatformEpisode
      );

      const createManySpy = vi
        .spyOn(db.socialPublication, "createMany")
        .mockResolvedValue({ count: 3 });

      const socials = createSocialClient({
        mockScenario: "immediate-text-success",
        provider: "mock",
      });

      const result = await publishEpisodeToSocials({
        db,
        episodeId: "ep_alice_1",
        socials,
        userId: "user_alice",
      });

      expect(result.success).toBeTruthy();
      expect(result.status).toBe("PUBLISHED");
      expect(result.outcomes).toHaveLength(3);
      expect(createManySpy).toHaveBeenCalledOnce();
    });
  });
});
