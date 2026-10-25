import {
  oauthInitiateQuerySchema,
  PLATFORM_TO_SDK_MAP,
  socialPlatformParamSchema,
} from "@faceless/contracts/social";
import { createPlatformConnectionUrl } from "@faceless/socials";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/env.server";
import { auth, socials } from "@/services";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    const loginUrl = new URL("/auth", env.BETTER_AUTH_URL);

    return NextResponse.redirect(loginUrl);
  }

  const { platform } = await params;
  const platformResult = socialPlatformParamSchema.safeParse(platform);

  if (!platformResult.success) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platform}` },
      { status: 400 }
    );
  }

  const queryResult = oauthInitiateQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );

  if (!queryResult.success) {
    return NextResponse.json(
      { error: "Missing required query parameters: state and redirect_uri" },
      { status: 400 }
    );
  }

  const normalizedPlatform = PLATFORM_TO_SDK_MAP[platformResult.data];
  const { redirect_uri: redirectUri, state } = queryResult.data;

  try {
    const callbackUrl = new URL("/api/social/callback", env.BETTER_AUTH_URL);
    callbackUrl.searchParams.set("platform", normalizedPlatform);
    callbackUrl.searchParams.set("redirect_uri", redirectUri);
    callbackUrl.searchParams.set("state", state);

    const connectionUrl = await createPlatformConnectionUrl(socials, {
      platform: normalizedPlatform,
      redirectUrl: callbackUrl.toString(),
      tenantId: session.user.id,
    });

    return NextResponse.redirect(new URL(connectionUrl));
  } catch {
    return NextResponse.json(
      { error: "Failed to initiate social provider connection" },
      { status: 500 }
    );
  }
};
