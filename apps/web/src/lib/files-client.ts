"use client";

import { useFiles } from "files-sdk/react";

export const useAppFiles = (options?: Parameters<typeof useFiles>[0]) =>
  useFiles({
    endpoint: "/api/files",
    ...options,
  });

export { useFile, useFiles, useList, useSearch } from "files-sdk/react";
