import {
  oauthCallbackQuerySchema,
  PLATFORM_TO_SDK_MAP,
} from "@faceless/contracts/social";
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

  const { platform, redirect_uri: redirectUri } = queryResult.data;
  const platformKey = PLATFORM_TO_SDK_MAP[platform];

  const accounts = await socials.accounts.list({
    authorization: { tenantId: session.user.id },
    backend: "default",
  });

  const matchedAccount = accounts.items.find(
    (item) => item.ref.platform === platformKey
  );

  if (!matchedAccount) {
    return NextResponse.json(
      { error: `No active ${platform} account found after authorization` },
      { status: 404 }
    );
  }

  const platformUserId = matchedAccount.ref.accountId;
  const platformUserName = matchedAccount.displayName;
  const db = getDb();

  await db.socialConnection.upsert({
    create: {
      accessToken: "managed_by_zernio",
      platform,
      platformUserId,
      platformUserName,
      status: "CONNECTED",
      userId: session.user.id,
    },
    update: {
      accessToken: "managed_by_zernio",
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
};
