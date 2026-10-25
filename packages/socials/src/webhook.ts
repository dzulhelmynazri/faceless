import type { AdapterOperationContext } from "@opencoredev/social-sdk";
import { z } from "zod";

import type { SocialClient } from "./client";

export interface WebhookVerificationInput {
  body: Uint8Array;
  headers: Headers;
}

const webhookEventSchema = z.object({
  accountIds: z.array(z.string()).default([]),
  backendRecordId: z.string().min(1).optional(),
  originalType: z.string().default("unknown"),
  type: z.string().default("unknown"),
});

export type DecodedSocialWebhookEvent = z.infer<typeof webhookEventSchema>;

export const verifyAndDecodeSocialWebhook = async (
  client: SocialClient,
  input: WebhookVerificationInput
): Promise<DecodedSocialWebhookEvent> => {
  const { webhooks } = client.adapter("default", { acknowledgeUnsafe: true });

  if (!webhooks) {
    throw new Error("Active provider does not support webhooks");
  }

  const context: AdapterOperationContext = {
    authorization: { tenantId: "system" },
    backendInstance: "default",
    correlationId: crypto.randomUUID(),
    retryBudget: { maxAttempts: 1, maxElapsedMs: 10_000 },
  };

  await webhooks.verify(input, context);

  const rawEvent: unknown = await webhooks.decode(input, context);

  return webhookEventSchema.parse(rawEvent);
};
