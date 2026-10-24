"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import type { FileInfo } from "files-sdk";
import type { UseFilesResult } from "files-sdk/react";
import { DownloadIcon, FileIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import * as React from "react";

export interface FileListProps {
  files: UseFilesResult;
  title?: string;
  prefix?: string;
  endpoint?: string;
  readOnly?: boolean;
  onSelect?: (file: FileInfo) => void;
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

const GENERIC_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
]);

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
]);

const isImageFile = (file: FileInfo): boolean => {
  const type = file.contentType.split(";")[0]?.trim().toLowerCase() ?? "";

  if (!GENERIC_TYPES.has(type)) {
    return type.startsWith("image/");
  }

  const name = file.key.slice(file.key.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");

  return dot > 0 && IMAGE_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
};

const Thumbnail = ({
  canSign,
  endpoint,
  file,
  filesRef,
}: {
  canSign: boolean | undefined;
  endpoint: string;
  file: FileInfo;
  filesRef: React.RefObject<UseFilesResult>;
}) => {
  const [signedSrc, setSignedSrc] = React.useState<string>();
  const [failed, setFailed] = React.useState(false);
  const isImage = isImageFile(file);

  const proxy = `${endpoint}${endpoint.includes("?") ? "&" : "?"}op=download&key=${encodeURIComponent(file.key)}`;
  const displaySrc = signedSrc ?? (canSign === false ? proxy : undefined);

  React.useEffect(() => {
    let cancelled = false;

    if (isImage && canSign === true) {
      const resolve = async () => {
        try {
          const next = await filesRef.current.url(file.key);

          if (!cancelled) {
            setSignedSrc(next);
          }
        } catch {
          if (!cancelled) {
            setSignedSrc(proxy);
          }
        }
      };

      void resolve();
    }

    return () => {
      cancelled = true;
    };
  }, [canSign, file.key, filesRef, isImage, proxy]);

  if (isImage && displaySrc !== undefined && displaySrc !== "" && !failed) {
    return (
      // oxlint-disable-next-line next/no-img-element
      <img
        alt={file.key}
        className="size-10 shrink-0 rounded object-cover"
        onError={() => {
          setFailed(true);
        }}
        src={displaySrc}
      />
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
      <FileIcon className="size-4" />
    </span>
  );
};

export const FileList = ({
  files,
  title = "Your Storage",
  prefix,
  endpoint = "/api/files",
  readOnly = false,
  onSelect,
  onChanged,
}: FileListProps) => {
  const [items, setItems] = React.useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [canSign, setCanSign] = React.useState<boolean>();
  const [actionError, setActionError] = React.useState<string>();

  const filesRef = React.useRef(files);
  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await filesRef.current.list(
          prefix !== undefined && prefix !== "" ? { prefix } : undefined
        );

        if (!cancelled) {
          setItems(result.items);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [prefix]);

  React.useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      try {
        const caps = await filesRef.current.capabilities();

        if (!cancelled) {
          setCanSign(caps.signedUrl.supported);
        }
      } catch {
        if (!cancelled) {
          setCanSign(false);
        }
      }
    };

    void resolve();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = React.useCallback(
    async (key: string) => {
      setActionError(undefined);

      try {
        await filesRef.current.delete(key);
        setItems((prev) => prev.filter((item) => item.key !== key));
        onChanged?.();
      } catch (error) {
        setActionError(
          `Couldn't delete ${key}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    [onChanged]
  );

  const handleDownload = React.useCallback(async (file: FileInfo) => {
    setActionError(undefined);

    try {
      const downloaded = await filesRef.current.download(file.key);
      const blob = await downloaded.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.download = file.key.split("/").pop() ?? file.key;
      anchor.href = url;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(
        `Couldn't download ${file.key}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {isLoading && items.length === 0
            ? "Loading files…"
            : `${items.length} ${items.length === 1 ? "file" : "files"}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-2">
          {actionError !== undefined && actionError !== "" && (
            <p className="text-xs text-destructive" role="alert">
              {actionError}
            </p>
          )}

          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Loading files…
            </div>
          ) : null}

          {!isLoading && items.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <FileIcon className="size-5 opacity-40" />
              <span>Nothing here yet.</span>
            </div>
          ) : null}

          {items.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors"
                  key={item.key}
                >
                  <button
                    className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 text-left transition-colors hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                    disabled={onSelect === undefined}
                    onClick={() => {
                      onSelect?.(item);
                    }}
                    type="button"
                  >
                    <Thumbnail
                      canSign={canSign}
                      endpoint={endpoint}
                      file={item}
                      filesRef={filesRef}
                      key={`${item.key}:${String(canSign)}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.key}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatBytes(item.size)} ·{" "}
                        {item.contentType || "unknown"}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => {
                        void handleDownload(item);
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <DownloadIcon data-icon="inline-start" />
                      Download
                    </Button>

                    {!readOnly && (
                      <Button
                        aria-label={`Delete ${item.key}`}
                        onClick={() => {
                          void handleRemove(item.key);
                        }}
                        size="icon-sm"
                        type="button"
                        variant="destructive"
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
