import { describe, expect, it } from "vitest";

import { createTestAuth } from "../test-auth";

describe("Better Auth Test Utilities", () => {
  it("initializes auth instance with test helpers on context", async () => {
    const auth = createTestAuth();
    const ctx = await auth.$context;

    expect(ctx.test).toBeDefined();
    expect("createUser" in ctx.test).toBeTruthy();
  });

  it("creates factory user objects with default values", async () => {
    const auth = createTestAuth();
    const ctx = await auth.$context;

    const user = ctx.test.createUser();

    expect(user.id).toBeDefined();
    expect(user.email).toMatch(/^test-.*@example\.com$/u);
    expect(user.emailVerified).toBeTruthy();
  });

  it("applies overrides when creating test users", async () => {
    const auth = createTestAuth();
    const ctx = await auth.$context;

    const user = ctx.test.createUser({
      email: "creator@faceless.video",
      name: "Faceless Creator",
    });

    expect(user.email).toBe("creator@faceless.video");
    expect(user.name).toBe("Faceless Creator");
  });

  it("configures expected mobile deep linking schemes and trusted origins", () => {
    const auth = createTestAuth();

    expect(auth.options.trustedOrigins).toStrictEqual([
      "http://localhost:3000",
      "faceless://",
      "exp://",
      "http://localhost:8081",
    ]);
    expect(auth.options.baseURL).toBe("http://localhost:3000");
  });

  it("propagates custom environment variables to auth options", () => {
    const auth = createTestAuth({
      AUTUMN_SECRET_KEY: "custom-autumn-key",
      BETTER_AUTH_SECRET: "custom-secret-must-be-32-chars-long!",
      BETTER_AUTH_URL: "https://auth.faceless.video",
      GOOGLE_CLIENT_ID: "custom-google-id",
      GOOGLE_CLIENT_SECRET: "custom-google-secret",
    });

    expect(auth.options.baseURL).toBe("https://auth.faceless.video");
    expect(auth.options.socialProviders.google.clientId).toBe(
      "custom-google-id"
    );
  });
});
