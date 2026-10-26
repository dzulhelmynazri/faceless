"use client";

import { cn } from "@faceless/ui/lib/utils";
import type { UseFilesResult } from "files-sdk/react";
import {
  CheckCircle2Icon,
  Loader2Icon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";

export interface UploadedEntry {
  key: string;
  name: string;
  data?: unknown;
}

interface PendingFile {
  file: File;
  path: string;
}

interface DropzoneContextValue {
  accept?: string;
  directory: boolean;
  maxFiles: number;
  maxSize?: number;
  isUploading: boolean;
  uploaded: UploadedEntry[];
  error?: string;
  contentId: string;
  open: () => void;
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

const matchesAccept = (file: File, accept: string | undefined): boolean => {
  const tokens = (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return name.endsWith(token);
    }

    if (token.endsWith("/*")) {
      return type.startsWith(token.slice(0, -1));
    }

    return type === token;
  });
};

const DropzoneContext = React.createContext<DropzoneContextValue | null>(null);

const useDropzoneContext = (): DropzoneContextValue => {
  const ctx = React.useContext(DropzoneContext);

  if (!ctx) {
    throw new Error("Dropzone components must be used inside <Dropzone>.");
  }

  return ctx;
};

const readAllEntries = async (
  reader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> =>
  // oxlint-disable-next-line promise/avoid-new -- readEntries is callback-only
  await new Promise((resolve, reject) => {
    const entries: FileSystemEntry[] = [];

    const drain = (): void => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(entries);

          return;
        }

        entries.push(...batch);
        drain();
      }, reject);
    };

    drain();
  });

const entryFile = async (entry: FileSystemFileEntry): Promise<File> =>
  // oxlint-disable-next-line promise/avoid-new -- entry.file is callback-only
  await new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });

const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry =>
  entry.isFile;

const isDirectoryEntry = (
  entry: FileSystemEntry
): entry is FileSystemDirectoryEntry => entry.isDirectory;

const traverseEntry = async (
  entry: FileSystemEntry
): Promise<PendingFile[]> => {
  if (isFileEntry(entry)) {
    const file = await entryFile(entry);

    return [{ file, path: entry.fullPath.slice(1) }];
  }

  if (isDirectoryEntry(entry)) {
    const children = await readAllEntries(entry.createReader());
    const nested = await Promise.all(children.map(traverseEntry));

    return nested.flat();
  }

  return [];
};

const collectDropped = async (
  dataTransfer: DataTransfer
): Promise<PendingFile[]> => {
  const flat: PendingFile[] = [];
  const directories: FileSystemEntry[] = [];

  for (const item of dataTransfer.items) {
    if (item.kind !== "file") {
      continue;
    }

    const entry = item.webkitGetAsEntry?.();
    const isDir = Boolean(entry?.isDirectory);

    if (isDir && entry !== undefined && entry !== null) {
      directories.push(entry);
      continue;
    }

    const file = item.getAsFile();

    if (file !== null) {
      flat.push({ file, path: "" });
    }
  }

  if (flat.length === 0 && directories.length === 0) {
    return [...dataTransfer.files].map((file) => ({ file, path: "" }));
  }

  const nested = await Promise.all(directories.map(traverseEntry));

  return [...flat, ...nested.flat()];
};

export interface DropzoneProps {
  files: UseFilesResult;
  prefix?: string;
  accept?: string;
  directory?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUploaded?: (entry: UploadedEntry) => void;
  onError?: (error: Error, file: File) => void;
  className?: string;
  children?: ReactNode;
}

export const Dropzone = ({
  files,
  prefix = "",
  accept,
  directory = false,
  maxFiles: maxFilesProp,
  maxSize,
  onUploaded,
  onError,
  className,
  children,
}: DropzoneProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<UploadedEntry[]>([]);

  const [failure, setFailure] = React.useState<{
    attempt: number;
    message: string;
  }>();

  const attemptRef = React.useRef(0);
  const contentId = React.useId();
  const statusId = React.useId();

  const maxFiles = maxFilesProp ?? (directory ? Number.POSITIVE_INFINITY : 1);
  const errorMessage = files.isUploading ? undefined : failure?.message;

  const handleUpload = React.useCallback(
    async (pending: PendingFile[]) => {
      if (pending.length === 0) {
        return;
      }

      attemptRef.current += 1;
      const attempt = attemptRef.current;
      setFailure(undefined);
      const failures: string[] = [];

      const fail = (name: string, file: File, cause: Error): void => {
        failures.push(`${name} (${cause.message})`);
        onError?.(cause, file);
      };

      const batch = pending.slice(0, maxFiles);

      await Promise.all(
        batch.map(async ({ file, path }) => {
          const name = path === "" ? file.name : path;

          if (!matchesAccept(file, accept)) {
            fail(
              name,
              file,
              new Error(`not an accepted file type (${accept})`)
            );

            return;
          }

          if (maxSize !== undefined && maxSize > 0 && file.size > maxSize) {
            fail(name, file, new Error(`larger than ${formatBytes(maxSize)}`));

            return;
          }

          let key: string | undefined;

          if (path !== "") {
            key = `${prefix}${path}`;
          } else if (prefix !== "") {
            key = `${prefix}${file.name}`;
          }

          try {
            const result =
              key !== undefined && key !== ""
                ? await files.upload(key, file, { contentType: file.type })
                : await files.upload(file);

            const entry: UploadedEntry = {
              key: result.key,
              name,
              data: "data" in result ? result.data : undefined,
            };

            setUploaded((prev) => [...prev, entry]);
            onUploaded?.(entry);
          } catch (error) {
            fail(
              name,
              file,
              error instanceof Error ? error : new Error(String(error))
            );
          }
        })
      );

      if (pending.length > maxFiles) {
        const skipped = pending.length - batch.length;
        failures.push(
          `${skipped} file${skipped === 1 ? "" : "s"} over the ${maxFiles}-file limit`
        );
      }

      if (failures.length > 0) {
        setFailure({
          attempt,
          message:
            failures.length === 1
              ? `Upload failed: ${failures[0]}`
              : `${failures.length} uploads failed: ${failures.join(", ")}`,
        });
      }
    },
    [accept, files, maxFiles, maxSize, onError, onUploaded, prefix]
  );

  const handleDrop = React.useCallback(
    async (dataTransfer: DataTransfer) => {
      await handleUpload(await collectDropped(dataTransfer));
    },
    [handleUpload]
  );

  const handleOpen = React.useCallback(() => {
    inputRef.current?.click();
  }, []);

  const contextValue = React.useMemo(
    () => ({
      accept,
      contentId,
      directory,
      error: errorMessage,
      isUploading: files.isUploading,
      maxFiles,
      maxSize,
      open: handleOpen,
      uploaded,
    }),
    [
      accept,
      contentId,
      directory,
      errorMessage,
      files.isUploading,
      maxFiles,
      maxSize,
      handleOpen,
      uploaded,
    ]
  );

  const busy = files.isUploading;
  const hasError = errorMessage !== undefined && errorMessage !== "";

  const describedBy =
    [uploaded.length > 0 ? contentId : "", hasError ? statusId : ""]
      .filter((v): v is string => Boolean(v))
      .join(" ") || undefined;

  return (
    <DropzoneContext.Provider value={contextValue}>
      <button
        aria-describedby={describedBy}
        aria-disabled={busy ? true : undefined}
        className={cn(
          "relative flex h-auto w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-border bg-card p-8 text-center text-card-foreground transition-all hover:border-primary/50 hover:bg-muted/30",
          isDragActive && "scale-[1.01] border-primary bg-primary/5",
          busy && "pointer-events-none cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (!busy) {
            handleOpen();
          }
        }}
        onDragLeave={() => {
          setIsDragActive(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(!busy);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);

          if (!busy) {
            void handleDrop(event.dataTransfer);
          }
        }}
        type="button"
      >
        {children}
      </button>

      <input
        accept={accept}
        aria-label="Upload files"
        className="hidden"
        multiple={maxFiles > 1}
        onChange={(event) => {
          const picked = [...(event.currentTarget.files ?? [])].map((file) => ({
            file,
            path: file.webkitRelativePath || "",
          }));

          void handleUpload(picked);
          event.currentTarget.value = "";
        }}
        ref={(node) => {
          inputRef.current = node;
          node?.toggleAttribute("webkitdirectory", directory);
        }}
        type="file"
      />

      <output aria-live="polite" className="sr-only" id={statusId}>
        {failure !== undefined && (
          <span key={failure.attempt}>{failure.message}</span>
        )}
      </output>
    </DropzoneContext.Provider>
  );
};

export interface DropzoneEmptyStateProps {
  className?: string;
  children?: ReactNode;
}

export const DropzoneEmptyState = ({
  className,
  children,
}: DropzoneEmptyStateProps) => {
  const { accept, directory, isUploading, maxFiles, maxSize } =
    useDropzoneContext();

  if (children !== undefined && children !== null) {
    return <span className={cn("block", className)}>{children}</span>;
  }

  let countLabel = "1 file";

  if (directory) {
    countLabel = Number.isFinite(maxFiles)
      ? `folder · up to ${maxFiles} files`
      : "folder upload";
  } else if (maxFiles > 1) {
    countLabel = `up to ${maxFiles} files`;
  }

  const prompt = directory
    ? "Drag & drop a folder or click to upload"
    : "Drag & drop or click to upload";

  return (
    <span
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-center",
        className
      )}
    >
      {isUploading ? (
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      ) : (
        <UploadIcon className="size-6" />
      )}
      <span className="text-sm font-medium">
        {isUploading ? "Uploading…" : prompt}
      </span>
      <span className="text-xs text-muted-foreground">
        {accept !== undefined && accept !== "" ? `${accept} · ` : ""}
        {countLabel}
        {maxSize !== undefined && maxSize > 0
          ? ` · max ${formatBytes(maxSize)}`
          : ""}
      </span>
    </span>
  );
};

export interface DropzoneContentProps {
  className?: string;
  children?: ReactNode;
}

export const DropzoneContent = ({
  className,
  children,
}: DropzoneContentProps) => {
  const { contentId, uploaded } = useDropzoneContext();

  if (uploaded.length === 0) {
    return null;
  }

  if (children !== undefined && children !== null) {
    return (
      <span
        aria-hidden="true"
        className={cn("block", className)}
        id={contentId}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("flex items-center gap-1.5 text-sm font-medium", className)}
      id={contentId}
    >
      <CheckCircle2Icon className="size-4 text-primary" />
      {uploaded.length === 1
        ? `Uploaded ${uploaded[0].name}`
        : `${uploaded.length} files uploaded`}
    </span>
  );
};

export interface DropzoneErrorProps {
  className?: string;
  children?: ReactNode;
}

export const DropzoneError = ({ className, children }: DropzoneErrorProps) => {
  const { error } = useDropzoneContext();

  if (error === undefined || error === "") {
    return null;
  }

  if (children !== undefined && children !== null) {
    return (
      <span aria-hidden="true" className={cn("block", className)}>
        {children}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center gap-1.5 text-sm text-destructive",
        className
      )}
    >
      <XCircleIcon className="size-4" />
      {error}
    </span>
  );
};
