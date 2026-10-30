import { createFiles as createFilesInstance } from "files-sdk";
import { memory } from "files-sdk/memory";
import { describe, expect, it } from "vitest";

import { createFiles, deleteTenantFiles } from "../index";

describe(deleteTenantFiles, () => {
  it("deletes all files across all four tenant prefixes while preserving other tenants", async () => {
    const memAdapter = memory();
    const files = createFilesInstance({ adapter: memAdapter });

    // Populate objects across the four documented tenant prefixes
    await files.upload("orgs/tenant_1/file.txt", "live object");
    await files.upload(".trash/orgs/tenant_1/trashed.txt", "trash object");
    await files.upload(".versions/orgs/tenant_1/snap.txt", "version object");
    await files.upload(
      ".trash/.versions/orgs/tenant_1/pruned.txt",
      "pruned version object"
    );

    // Populate another tenant's object to verify isolation
    await files.upload("orgs/tenant_2/safe.txt", "other tenant object");

    const result = await deleteTenantFiles(files, "tenant_1");

    expect(result.deleted).toBe(4);
    expect(result.failed).toStrictEqual([]);

    // Verify tenant 1 objects are deleted
    const deletedExistence = await Promise.all([
      files.exists("orgs/tenant_1/file.txt"),
      files.exists(".trash/orgs/tenant_1/trashed.txt"),
      files.exists(".versions/orgs/tenant_1/snap.txt"),
      files.exists(".trash/.versions/orgs/tenant_1/pruned.txt"),
    ]);

    expect(deletedExistence).toStrictEqual([false, false, false, false]);

    // Verify tenant 2 object remains intact
    await expect(files.exists("orgs/tenant_2/safe.txt")).resolves.toBeTruthy();
  });

  it("handles empty tenants with 0 files gracefully", async () => {
    const memAdapter = memory();
    const files = createFilesInstance({ adapter: memAdapter });

    const result = await deleteTenantFiles(files, "tenant_empty");

    expect(result.deleted).toBe(0);
    expect(result.failed).toStrictEqual([]);
  });
});

describe(createFiles, () => {
  it("instantiates a Files instance with provided R2 credentials", () => {
    const storage = createFiles({
      R2_ACCESS_KEY_ID: "mock-key",
      R2_ACCOUNT_ID: "mock-account",
      R2_BUCKET: "mock-bucket",
      R2_PUBLIC_BASE_URL: "https://r2.example.com",
      R2_SECRET_ACCESS_KEY: "mock-secret",
    });

    expect(storage).toBeDefined();
    expect(storage.adapter).toBeDefined();
  });

  it("wires cache, versioning, and soft-delete plugins onto client instance", () => {
    const storage = createFiles({
      R2_ACCESS_KEY_ID: "mock-key",
      R2_ACCOUNT_ID: "mock-account",
      R2_BUCKET: "mock-bucket",
      R2_PUBLIC_BASE_URL: "https://r2.example.com",
      R2_SECRET_ACCESS_KEY: "mock-secret",
    });

    expect(storage.cacheStats).toBeDefined();
    expect(storage.restoreVersion).toBeDefined();
    expect(storage.purge).toBeDefined();
    expect(storage.restoreTrashed).toBeDefined();
  });

  it("passes optional custom scoping prefix to the Files instance", () => {
    const storage = createFiles(
      {
        R2_ACCESS_KEY_ID: "mock-key",
        R2_ACCOUNT_ID: "mock-account",
        R2_BUCKET: "mock-bucket",
        R2_PUBLIC_BASE_URL: "https://r2.example.com",
        R2_SECRET_ACCESS_KEY: "mock-secret",
      },
      { prefix: "users/u_123" }
    );

    expect(storage.prefix).toBe("users/u_123");
  });
});
