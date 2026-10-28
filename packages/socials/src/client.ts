import { createSocial } from "@opencoredev/social-sdk";
import { zernio } from "@opencoredev/social-sdk/cloud/zernio";
import {
  MemoryIdempotencyStore,
  mockBackend,
} from "@opencoredev/social-sdk/testing";
import type { MockScenario } from "@opencoredev/social-sdk/testing";

export type SocialClientOptions =
  | { mockScenario: MockScenario; provider: "mock" }
  | { apiKey: string; provider: "zernio"; webhookSecret: string };

export const createSocialClient = (options: SocialClientOptions) => {
  const idempotencyStore = new MemoryIdempotencyStore();

  switch (options.provider) {
    case "mock": {
      return createSocial({
        backend: mockBackend({ scenario: options.mockScenario }),
        idempotencyStore,
      });
    }

    case "zernio": {
      return createSocial({
        backend: zernio({
          apiKey: options.apiKey,
          webhookSecret: options.webhookSecret,
        }),
        idempotencyStore,
      });
    }

    default: {
      throw new Error("Unsupported social client provider");
    }
  }
};

export type SocialClient = ReturnType<typeof createSocialClient>;
