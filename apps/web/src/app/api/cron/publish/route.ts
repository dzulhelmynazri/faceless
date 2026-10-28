import { publishEpisodeToSocials } from "@faceless/api";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/env.server";
import { isBearerAuthorized } from "@/lib/is-authorized";
import { getDb, socials } from "@/services";

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");

  if (!isBearerAuthorized(authHeader, env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  // Find approved episodes that are due for publication
  const dueEpisodes = await db.seriesEpisode.findMany({
    include: {
      series: true,
    },
    take: 10,
    where: {
      scheduledFor: { lte: now },
      series: {
        status: "ACTIVE",
      },
      status: "APPROVED",
      videoUrl: { not: null },
    },
  });

  const results = await Promise.all(
    dueEpisodes.map(async (episode) => {
      try {
        const publishResult = await publishEpisodeToSocials({
          db,
          episodeId: episode.id,
          socials,
          userId: episode.series.userId,
        });

        return {
          episodeId: episode.id,
          status: publishResult.status,
          success: publishResult.success,
        };
      } catch {
        return {
          episodeId: episode.id,
          error: "Publication failed",
          status: "FAILED",
          success: false,
        };
      }
    })
  );

  return NextResponse.json({
    processedCount: results.length,
    results,
    timestamp: now.toISOString(),
  });
};
