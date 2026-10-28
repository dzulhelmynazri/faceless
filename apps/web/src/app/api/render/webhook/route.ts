import { resolveScheduledFor } from "@faceless/api";
import { renderWebhookPayloadSchema } from "@faceless/contracts/series";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/env.server";
import { isBearerAuthorized } from "@/lib/is-authorized";
import { getDb } from "@/services";

export const POST = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");

  if (!isBearerAuthorized(authHeader, env.RENDER_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = renderWebhookPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid webhook payload schema" },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const db = getDb();

  const episode = await db.seriesEpisode.findUnique({
    include: {
      series: true,
    },
    where: { id: payload.episodeId },
  });

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  if (episode.status !== "RENDERING") {
    return NextResponse.json({ received: true });
  }

  if (payload.status === "completed") {
    const scheduledFor = resolveScheduledFor(
      episode.scheduledFor,
      episode.series.publishTime
    );

    await db.seriesEpisode.update({
      data: {
        scheduledFor,
        status: "APPROVED",
        videoUrl: payload.videoUrl,
      },
      where: { id: episode.id },
    });
  } else {
    await db.seriesEpisode.update({
      data: {
        error: payload.error,
        status: "FAILED",
      },
      where: { id: episode.id },
    });
  }

  return NextResponse.json({ received: true });
};
