import { expo } from "@better-auth/expo";
import type { Database } from "@faceless/db";
import { autumn } from "autumn-js/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";

interface Env {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AUTUMN_SECRET_KEY: string;
}

export const createAuth = (env: Env, database: Database) =>
  betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(database, {
      provider: "postgresql",
    }),
    emailAndPassword: { enabled: true },
    plugins: [
      expo(),
      organization(),
      autumn({
        secretKey: env.AUTUMN_SECRET_KEY,
        customerScope: "user_and_organization",
      }),
      nextCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      "faceless://",
      "exp://",
      "http://localhost:8081",
    ],
  });

export type Auth = ReturnType<typeof createAuth>;
