import { verifyAndDecodeSocialWebhook } from "@faceless/socials";
import type { DecodedSocialWebhookEvent } from "@faceless/socials";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getDb, socials } from "@/services";

export const POST = async (req: NextRequest) => {
  let event: DecodedSocialWebhookEvent;

  try {
    event = await verifyAndDecodeSocialWebhook(socials, {
      body: new Uint8Array(await req.arrayBuffer()),
      headers: req.headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const db = getDb();

  if (event.type === "account.updated" && event.accountIds.length > 0) {
    await db.socialConnection.updateMany({
      data: {
        status:
          event.originalType === "account.disconnected"
            ? "REVOKED"
            : "CONNECTED",
      },
      where: {
        platformUserId: { in: event.accountIds },
      },
    });
  }

  if (
    event.type === "publication.updated" &&
    event.backendRecordId !== undefined
  ) {
    if (
      event.originalType === "post.platform.published" ||
      event.originalType === "post.published"
    ) {
      await db.socialPublication.updateMany({
        data: {
          publishedAt: new Date(),
          status: "published",
        },
        where: {
          externalPostId: event.backendRecordId,
        },
      });
    } else if (
      event.originalType === "post.platform.failed" ||
      event.originalType === "post.failed"
    ) {
      await db.socialPublication.updateMany({
        data: {
          status: "failed",
        },
        where: {
          externalPostId: event.backendRecordId,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
};
