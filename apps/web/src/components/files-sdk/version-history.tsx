"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { isNonEmptyString } from "@faceless/utils";
import type { FileVersion, UseFilesResult } from "files-sdk/react";
import { HistoryIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";
import * as React from "react";

export interface VersionHistoryProps {
  /** A `useFiles()` instance backed by a gateway with the `versioning()` plugin. */
  files: UseFilesResult;
  /** The key whose history to show. */
  fileKey: string;
  /** Called after a successful restore. */
  onRestored?: (file: { key: string }) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

/**
 * A version timeline for one key, backed by the `versioning()` plugin.
 * Lists the saved snapshots of earlier contents and restores any of them.
 */
export const VersionHistory = ({
  files,
  fileKey,
  onRestored,
}: VersionHistoryProps) => {
  const [versions, setVersions] = React.useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [restoring, setRestoring] = React.useState<string | undefined>();

  const filesRef = React.useRef(files);

  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const refresh = React.useCallback(async () => {
    try {
      const items = await filesRef.current.versions(fileKey);

      setVersions(items);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [fileKey]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const restore = React.useCallback(
    async (versionId: string) => {
      setRestoring(versionId);

      try {
        const file = await filesRef.current.restoreVersion(fileKey, versionId);

        await refresh();
        onRestored?.(file);
      } catch {
        // Mirrored to `files.error`
      }

      setRestoring(undefined);
    },
    [fileKey, refresh, onRestored]
  );

  const hasVersions = versions.length > 0;

  let description = `${versions.length} ${versions.length === 1 ? "version" : "versions"} of "${fileKey}"`;

  if (isLoading && !hasVersions) {
    description = "Loading version history…";
  } else if (!hasVersions) {
    description = `No earlier versions yet for "${fileKey}"`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version History</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          {isLoading && !hasVersions ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Loading version
              history…
            </div>
          ) : null}

          {!isLoading && !hasVersions ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <HistoryIcon className="size-5 opacity-40" />
              <span>No earlier versions yet for &ldquo;{fileKey}&rdquo;</span>
            </div>
          ) : null}

          {hasVersions ? (
            <ol className="flex flex-col gap-2">
              {versions.map((version, index) => (
                <li
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors"
                  key={version.versionId}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <HistoryIcon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {new Date(version.lastModified).toLocaleString()}
                      {index === 0 ? (
                        <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground">
                          Previous
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(version.size)}
                      {isNonEmptyString(version.etag)
                        ? ` · ${version.etag.slice(0, 10)}`
                        : ""}
                    </p>
                  </div>

                  <Button
                    disabled={restoring !== undefined}
                    onClick={() => {
                      void restore(version.versionId);
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {restoring === version.versionId ? (
                      <Loader2Icon
                        className="animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <RotateCcwIcon data-icon="inline-start" />
                    )}
                    Restore
                  </Button>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
