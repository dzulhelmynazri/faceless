import { createTestAuth } from "@faceless/auth/test";
import { createFiles, FilesError } from "@faceless/storage";
import { describe, expect, it } from "vitest";

import { userPolicy } from "../files-policy";

const mockFiles = createFiles({
  R2_ACCESS_KEY_ID: "test-key",
  R2_ACCOUNT_ID: "test-account",
  R2_BUCKET: "test-bucket",
  R2_PUBLIC_BASE_URL: "https://r2.example.com",
  R2_SECRET_ACCESS_KEY: "test-secret",
});

describe(userPolicy, () => {
  it("rejects unauthenticated requests with Unauthorized FilesError", async () => {
    const policy = userPolicy({
      files: mockFiles,
      getSession: async () => {
        await Promise.resolve();

        return null;
      },
    });

    const mockRequest = new Request("http://localhost:3000/api/files");

    await expect(
      policy({
        key: "avatar.png",
        operation: "upload",
        params: {},
        req: mockRequest,
      })
    ).rejects.toThrow(FilesError);

    await expect(
      policy({
        key: "avatar.png",
        operation: "upload",
        params: {},
        req: mockRequest,
      })
    ).rejects.toMatchObject({
      code: "Unauthorized",
    });
  });

  it("authorizes authenticated Better Auth user and isolates keyPrefix to user ID", async () => {
    const auth = createTestAuth();
    const authCtx = await auth.$context;

    const user = authCtx.test.createUser({
      email: "creator@faceless.video",
      id: "usr_creator_999",
      name: "Creator",
    });

    const policy = userPolicy({
      files: mockFiles,
      getSession: async () => {
        await Promise.resolve();

        return {
          session: {
            id: "sess_123",
            userId: user.id,
          },
          user,
        };
      },
    });

    const mockRequest = new Request("http://localhost:3000/api/files");

    const result = await policy({
      key: "scene_1.webp",
      operation: "upload",
      params: {},
      req: mockRequest,
    });

    expect(result).toBeDefined();
    expect(result?.keyPrefix).toBe(`users/${user.id}/`);
    expect(result?.context?.user.id).toBe(user.id);
  });

  it("enforces strict multi-tenant prefix separation between different users", async () => {
    const auth = createTestAuth();
    const authCtx = await auth.$context;

    const userAlice = authCtx.test.createUser({ id: "tenant_alice" });
    const userBob = authCtx.test.createUser({ id: "tenant_bob" });

    const policyAlice = userPolicy({
      files: mockFiles,
      getSession: async () => {
        await Promise.resolve();

        return {
          session: { id: "s1", userId: userAlice.id },
          user: userAlice,
        };
      },
    });

    const policyBob = userPolicy({
      files: mockFiles,
      getSession: async () => {
        await Promise.resolve();

        return {
          session: { id: "s2", userId: userBob.id },
          user: userBob,
        };
      },
    });

    const mockRequest = new Request("http://localhost:3000/api/files");

    const resultAlice = await policyAlice({
      key: "voiceover.mp3",
      operation: "download",
      params: {},
      req: mockRequest,
    });

    const resultBob = await policyBob({
      key: "voiceover.mp3",
      operation: "download",
      params: {},
      req: mockRequest,
    });

    expect(resultAlice).toBeDefined();
    expect(resultBob).toBeDefined();
    expect(resultAlice?.keyPrefix).toBe("users/tenant_alice/");
    expect(resultBob?.keyPrefix).toBe("users/tenant_bob/");
    expect(resultAlice?.keyPrefix).not.toBe(resultBob?.keyPrefix);
  });

  it("enables inline disposition specifically for preview url operations", async () => {
    const auth = createTestAuth();
    const authCtx = await auth.$context;
    const user = authCtx.test.createUser({ id: "usr_test_preview" });

    const policy = userPolicy({
      files: mockFiles,
      getSession: async () => {
        await Promise.resolve();

        return {
          session: { id: "s1", userId: user.id },
          user,
        };
      },
    });

    const mockRequest = new Request("http://localhost:3000/api/files");

    const result = await policy({
      key: "scene_preview.png",
      operation: "url",
      params: {},
      req: mockRequest,
    });

    expect(result).toBeDefined();
    expect(result?.disposition).toBe("inline");
  });
});
