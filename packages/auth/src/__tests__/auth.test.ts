import { createPrismaClient } from "@faceless/db";
import { describe, expect, it } from "vitest";

import { createAuth } from "../index";

describe(createAuth, () => {
  const env = {
    AUTUMN_SECRET_KEY: "am_sk_test_123",
    BETTER_AUTH_SECRET: "better-auth-secret-32-characters-minimum",
    BETTER_AUTH_URL: "https://auth.faceless.video",
    GOOGLE_CLIENT_ID: "google-client-id-xyz",
    GOOGLE_CLIENT_SECRET: "google-client-secret-abc",
  };

  const db = createPrismaClient({
    DATABASE_URL: "postgresql://localhost:5432/test",
  });

  it("configures base URL, secret, and rate limiting options", () => {
    const auth = createAuth(env, db);

    expect(auth.options.baseURL).toBe("https://auth.faceless.video");
    expect(auth.options.secret).toBe(
      "better-auth-secret-32-characters-minimum"
    );
    expect(auth.options.rateLimit).toStrictEqual({
      max: 100,
      window: 10,
    });
  });

  it("configures session cookie cache and mobile trusted origins", () => {
    const auth = createAuth(env, db);

    expect(auth.options.session?.cookieCache).toStrictEqual({
      enabled: true,
      maxAge: 300,
    });
    expect(auth.options.trustedOrigins).toStrictEqual([
      "https://auth.faceless.video",
      "faceless://",
      "exp://",
      "http://localhost:8081",
    ]);
  });

  it("configures Google social provider and account linking", () => {
    const auth = createAuth(env, db);

    expect(auth.options.socialProviders.google.clientId).toBe(
      "google-client-id-xyz"
    );
    expect(auth.options.socialProviders.google.clientSecret).toBe(
      "google-client-secret-abc"
    );
    expect(auth.options.account?.accountLinking).toStrictEqual({
      enabled: true,
      requireLocalEmailVerified: false,
      trustedProviders: ["google"],
    });
  });
});
