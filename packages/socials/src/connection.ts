import type { SupportedSocialPlatform } from "@faceless/contracts/social";
import type { AdapterOperationContext } from "@opencoredev/social-sdk";
import { z } from "zod";

import type { SocialClient } from "./client";

export const zernioProfileSchema = z.object({
  _id: z.string().min(1),
});

export const zernioProfileListSchema = z.array(zernioProfileSchema);

export const zernioConnectionResultSchema = z.object({
  url: z.url(),
});

export interface CreatePlatformConnectionInput {
  platform: SupportedSocialPlatform;
  redirectUrl: string;
  tenantId: string;
}

export const createPlatformConnectionUrl = async (
  client: SocialClient,
  input: CreatePlatformConnectionInput
): Promise<string> => {
  const context: AdapterOperationContext = {
    authorization: { tenantId: input.tenantId },
    backendInstance: "default",
    correlationId: crypto.randomUUID(),
    retryBudget: { maxAttempts: 1, maxElapsedMs: 30_000 },
  };

  const native = client.native("default", { acknowledgeUnsafe: true });

  if (
    !native ||
    !("listProfiles" in native) ||
    !("createConnection" in native)
  ) {
    throw new Error(
      "Active social provider does not support hosted connection flows"
    );
  }

  const rawProfiles: unknown = await native.listProfiles(context);
  const parsedProfiles = zernioProfileListSchema.safeParse(rawProfiles);

  if (!parsedProfiles.success) {
    throw new Error("Invalid profiles response from social provider");
  }

  const [profile] = parsedProfiles.data;

  if (!profile) {
    throw new Error("No active profile found in social provider");
  }

  const rawResult: unknown = await native.createConnection(
    {
      platform: input.platform,
      profileId: profile._id,
      redirectUrl: input.redirectUrl,
    },
    context
  );

  const parsedResult = zernioConnectionResultSchema.safeParse(rawResult);

  if (!parsedResult.success) {
    throw new Error("Invalid connection response from social provider");
  }

  return parsedResult.data.url;
};
