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
});
