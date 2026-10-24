import { createEmailClient } from "@opencoredev/email-sdk";
import { cloudflare } from "@opencoredev/email-sdk/cloudflare";

export interface EmailConfig {
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}

export const createEmail = (env: EmailConfig) =>
  createEmailClient({
    adapters: [
      cloudflare({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        apiToken: env.CLOUDFLARE_API_TOKEN,
      }),
    ],
  });

export type { EmailClient } from "@opencoredev/email-sdk";
