"use client";

import { isNonEmptyString } from "@faceless/utils";
import type { UseFilesResult } from "files-sdk/react";

import { useAppFiles } from "@/lib/files-client";

import { TrashBin } from "./trash-bin";
import { VersionHistory } from "./version-history";

export interface RecoveryProps {
  /** Optional custom files instance; defaults to `useAppFiles()` */
  files?: UseFilesResult;
  /** Optional fileKey to show specific version history */
  fileKey?: string;
  /** Callback fired when a file is restored or purged */
  onChanged?: () => void;
  className?: string;
}

export const Recovery = ({
  files: propFiles,
  fileKey,
  onChanged,
  className,
}: RecoveryProps) => {
  const defaultFiles = useAppFiles();
  const files = propFiles ?? defaultFiles;

  return (
    <div className={className ?? "flex flex-col gap-6"}>
      {isNonEmptyString(fileKey) ? (
        <VersionHistory
          fileKey={fileKey}
          files={files}
          onRestored={onChanged}
        />
      ) : null}

      <TrashBin files={files} onChanged={onChanged} />

      {files.error ? (
        <p className="text-xs text-destructive" role="alert">
          {files.error.message}
        </p>
      ) : null}
    </div>
  );
};
