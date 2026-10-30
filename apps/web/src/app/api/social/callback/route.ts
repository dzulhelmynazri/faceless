import {
  oauthCallbackQuerySchema,
  PLATFORM_TO_SDK_MAP,
} from "@faceless/contracts/social";
import { isNonEmptyString } from "@faceless/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/env.server";
import { auth, getDb, socials } from "@/services";

export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    const loginUrl = new URL("/auth", env.BETTER_AUTH_URL);

    return NextResponse.redirect(loginUrl);
  }

  const queryResult = oauthCallbackQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );

  if (!queryResult.success) {
    return NextResponse.json(
      { error: "Missing or invalid query parameters" },
      { status: 400 }
    );
  }

  const {
    accountId,
    platform,
    redirect_uri: redirectUri,
    username,
  } = queryResult.data;

  const platformKey = PLATFORM_TO_SDK_MAP[platform];

  let platformUserId = accountId;
  let platformUserName = username;

  if (
    !isNonEmptyString(platformUserId) ||
    !isNonEmptyString(platformUserName)
  ) {
    try {
      const accounts = await socials.accounts.list({
        authorization: { tenantId: session.user.id },
        backend: "default",
      });

      const matchedAccount = accounts.items.find(
        (item) => item.ref.platform === platformKey
      );

      if (matchedAccount) {
        platformUserId = matchedAccount.ref.accountId;
        platformUserName = matchedAccount.displayName;
      }
    } catch {
      return NextResponse.json(
        { error: `No active ${platform} account found after authorization` },
        { status: 404 }
      );
    }
  }

  if (
    !isNonEmptyString(platformUserId) ||
    !isNonEmptyString(platformUserName)
  ) {
    return NextResponse.json(
      { error: `No active ${platform} account found after authorization` },
      { status: 404 }
    );
  }

  try {
    const db = getDb();

    await db.socialConnection.upsert({
      create: {
        platform,
        platformUserId,
        platformUserName,
        status: "CONNECTED",
        userId: session.user.id,
      },
      update: {
        platformUserName,
        status: "CONNECTED",
      },
      where: {
        userId_platform_platformUserId: {
          platform,
          platformUserId,
          userId: session.user.id,
        },
      },
    });

    const targetUrl = new URL(redirectUri, env.BETTER_AUTH_URL);

    return NextResponse.redirect(targetUrl);
  } catch {
    return NextResponse.json(
      { error: "Failed to save social account connection" },
      { status: 500 }
    );
  }
};
