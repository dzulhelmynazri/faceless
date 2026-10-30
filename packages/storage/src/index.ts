import type { Files } from "files-sdk";
import { createFiles as createFilesInstance } from "files-sdk";
import { cache } from "files-sdk/cache";
import { contentType } from "files-sdk/content-type";
import { r2 } from "files-sdk/r2";
import { softDelete } from "files-sdk/soft-delete";
import { validation } from "files-sdk/validation";
import { versioning } from "files-sdk/versioning";

export interface Env {
  R2_BUCKET: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_PUBLIC_BASE_URL: string;
}

export interface StorageOptions {
  prefix?: string;
}

export const createFiles = (env: Env, options?: StorageOptions) =>
  createFilesInstance({
    prefix: options?.prefix,
    adapter: r2({
      accountId: env.R2_ACCOUNT_ID,
      bucket: env.R2_BUCKET,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      publicBaseUrl: env.R2_PUBLIC_BASE_URL,
    }),
    plugins: [
      cache({
        operations: ["head", "download"],
        maxBytes: 256 * 1024,
      }),
      contentType({ onMismatch: "correct" }),
      validation({
        maxSize: 15 * 1024 * 1024,
        minSize: 1,
        allowedTypes: ["image/*", "video/*", "audio/*"],
      }),
      versioning({ ignore: [".trash"], limit: 20 }),
      softDelete(),
    ],
  });

export const deleteTenantFiles = async (files: Files, orgId: string) => {
  // Erase all four tenant prefixes documented in Files SDK restore & multi-tenant guides:
  // 1. orgs/${orgId}/ (live objects)
  // 2. .trash/orgs/${orgId}/ (trashed objects)
  // 3. .versions/orgs/${orgId}/ (version snapshots)
  // 4. .trash/.versions/orgs/${orgId}/ (pruned versions)
  const prefixes = [
    `orgs/${orgId}`,
    `.trash/orgs/${orgId}`,
    `.versions/orgs/${orgId}`,
    `.trash/.versions/orgs/${orgId}`,
  ];

  const results = await Promise.all(
    prefixes.map(async (prefix) => {
      // Un-plugined instance for real hard deletion that bypasses softDelete and versioning
      const unmanagedInstance = createFilesInstance({
        adapter: files.adapter,
        prefix,
      });

      const keys: string[] = [];

      for await (const file of unmanagedInstance.listAll()) {
        keys.push(file.key);
      }

      if (keys.length === 0) {
        return { deleted: 0, failed: [] };
      }

      const deleteResult = await unmanagedInstance.delete(keys);

      return {
        deleted: deleteResult.results.length,
        failed: deleteResult.errors ?? [],
      };
    })
  );

  let totalDeleted = 0;
  const allFailed: { error: unknown; key: string }[] = [];

  for (const res of results) {
    totalDeleted += res.deleted;
    allFailed.push(...res.failed);
  }

  return {
    deleted: totalDeleted,
    failed: allFailed,
  };
};

export { Files, FilesError } from "files-sdk";

export { memory } from "files-sdk/memory";

export type { FileInfo, StoredFile } from "files-sdk";
