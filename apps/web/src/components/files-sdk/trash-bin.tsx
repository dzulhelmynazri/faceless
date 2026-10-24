"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@faceless/ui/components/dialog";
import type { TrashedFile, UseFilesResult } from "files-sdk/react";
import {
  Loader2Icon,
  RotateCcwIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import * as React from "react";

export interface TrashBinProps {
  /** A `useFiles()` instance backed by a gateway with the `softDelete()` plugin. */
  files: UseFilesResult;
  /** Called after a successful restore or purge. */
  onChanged?: () => void;
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
 * A recycle bin backed by the `softDelete()` plugin. Lists trashed objects and
 * restores or permanently purges them through the same `useFiles()` instance.
 */
export const TrashBin = ({ files, onChanged }: TrashBinProps) => {
  const [trashed, setTrashed] = React.useState<TrashedFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | undefined>();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  const filesRef = React.useRef(files);

  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const refresh = React.useCallback(async () => {
    try {
      const items = await filesRef.current.trashed();

      setTrashed(items);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const restore = React.useCallback(
    async (key: string) => {
      setBusy(key);

      try {
        await filesRef.current.restoreTrashed(key);
        await refresh();
        onChanged?.();
      } catch {
        // Mirrored to `files.error`
      }

      setBusy(undefined);
    },
    [refresh, onChanged]
  );

  const purge = React.useCallback(async () => {
    if (pendingKey === null) {
      return;
    }

    setBusy(pendingKey);

    try {
      await filesRef.current.purge(pendingKey);
      setPendingKey(null);
      await refresh();
      onChanged?.();
    } catch {
      // Mirrored to `files.error`
    }

    setBusy(undefined);
  }, [pendingKey, refresh, onChanged]);

  const hasItems = trashed.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recycle Bin</CardTitle>
        <CardDescription>
          {isLoading && !hasItems
            ? "Loading trash…"
            : `${trashed.length} ${trashed.length === 1 ? "item" : "items"} in trash`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          {isLoading && !hasItems ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Loading trash…
            </div>
          ) : null}

          {!isLoading && !hasItems ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <TrashIcon className="size-5 opacity-40" />
              <span>Trash is empty</span>
            </div>
          ) : null}

          {hasItems ? (
            <ul className="flex flex-col gap-2">
              {trashed.map((item) => (
                <li
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors"
                  key={item.key}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Trash2Icon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.size)}
                      {item.lastModified === undefined ? null : (
                        <span>
                          {` · Deleted ${new Date(item.lastModified).toLocaleDateString()}`}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      disabled={busy !== undefined}
                      onClick={() => {
                        void restore(item.key);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {busy === item.key ? (
                        <Loader2Icon
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                      ) : (
                        <RotateCcwIcon data-icon="inline-start" />
                      )}
                      Restore
                    </Button>

                    <Button
                      disabled={busy !== undefined}
                      onClick={() => {
                        setPendingKey(item.key);
                      }}
                      size="icon-sm"
                      type="button"
                      variant="destructive"
                      aria-label={`Permanently delete ${item.key}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </CardContent>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setPendingKey(null);
          }
        }}
        open={pendingKey !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete permanently?</DialogTitle>
            <DialogDescription>
              {`"${pendingKey ?? ""}" will be permanently erased from storage. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setPendingKey(null);
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={busy !== undefined}
              onClick={() => {
                void purge();
              }}
              type="button"
              variant="destructive"
            >
              {busy === undefined ? null : (
                <Loader2Icon
                  data-icon="inline-start"
                  className="animate-spin"
                />
              )}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
