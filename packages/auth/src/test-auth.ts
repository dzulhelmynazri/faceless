import { expo } from "@better-auth/expo";
import type { Database } from "@faceless/db";
import { autumn } from "autumn-js/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { testUtils } from "better-auth/plugins";

import type { AuthEnv } from "./index";

export const TEST_AUTH_ENV: AuthEnv = {
  AUTUMN_SECRET_KEY: "am_sk_test_key",
  BETTER_AUTH_SECRET: "test-secret-must-be-32-chars-minimum-length!",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
};

export interface CreateTestAuthOptions {
  captureOTP?: boolean;
}

export const createTestAuth = (
  env: AuthEnv = TEST_AUTH_ENV,
  database?: Database,
  options?: CreateTestAuthOptions
) => {
  const baseConfig = {
    account: {
      accountLinking: {
        enabled: true as const,
        requireLocalEmailVerified: false as const,
        trustedProviders: ["google" as const],
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true },
    plugins: [
      expo(),
      autumn({
        customerScope: "user",
        secretKey: env.AUTUMN_SECRET_KEY,
      }),
      nextCookies(),
      testUtils({ captureOTP: options?.captureOTP ?? false }),
    ],
    rateLimit: {
      max: 1000,
      window: 10,
    },
    secret: env.BETTER_AUTH_SECRET,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      "faceless://",
      "exp://",
      "http://localhost:8081",
    ],
    user: {
      deleteUser: {
        enabled: true,
      },
    },
  };

  if (database) {
    return betterAuth({
      ...baseConfig,
      database: prismaAdapter(database, {
        provider: "postgresql",
      }),
    });
  }

  return betterAuth(baseConfig);
};

export type TestAuth = ReturnType<typeof createTestAuth>;

export type { TestHelpers } from "better-auth/plugins";
