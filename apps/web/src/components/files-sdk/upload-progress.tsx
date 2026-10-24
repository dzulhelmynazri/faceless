"use client";

import { Progress } from "@faceless/ui/components/progress";
import { cn } from "@faceless/ui/lib/utils";
import type { FileUploadState, UseFilesResult } from "files-sdk/react";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";

export interface UploadProgressProps {
  files: UseFilesResult;
  className?: string;
}

const StatusIcon = ({ status }: { status: FileUploadState["status"] }) => {
  if (status === "success") {
    return <CheckCircle2Icon className="size-4 text-primary" />;
  }

  if (status === "error") {
    return <XCircleIcon className="size-4 text-destructive" />;
  }

  if (status === "aborted") {
    return <XCircleIcon className="size-4 text-muted-foreground" />;
  }

  return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />;
};

const statusText = (upload: FileUploadState): string => {
  if (upload.status === "error") {
    const message = upload.error?.message;

    if (message === undefined || message === "") {
      return "Upload failed";
    }

    return `Failed: ${message}`;
  }

  if (upload.status === "aborted") {
    return "Cancelled";
  }

  return `${Math.round(upload.progress * 100)}%`;
};

const announcement = (upload: FileUploadState): string | undefined => {
  if (upload.status === "success") {
    return `${upload.name} uploaded`;
  }

  if (upload.status === "error") {
    const message = upload.error?.message;

    if (message === undefined || message === "") {
      return `${upload.name} failed to upload`;
    }

    return `${upload.name} failed: ${message}`;
  }

  if (upload.status === "aborted") {
    return `${upload.name} cancelled`;
  }

  return undefined;
};

const rowKey = (upload: FileUploadState, index: number): string =>
  `${upload.key ?? upload.name}-${index}`;

const UploadRow = ({ upload }: { upload: FileUploadState }) => (
  <li className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2 text-sm">
      <StatusIcon status={upload.status} />
      <span className="min-w-0 flex-1 truncate">{upload.name}</span>
      <span
        className={cn(
          "max-w-[50%] truncate text-xs text-muted-foreground",
          upload.status === "error" && "text-destructive"
        )}
      >
        {statusText(upload)}
      </span>
    </div>
    <Progress
      aria-label={upload.name}
      aria-valuenow={Math.round(upload.progress * 100)}
      aria-valuetext={statusText(upload)}
      value={upload.progress * 100}
    />
  </li>
);

export const UploadProgress = ({ files, className }: UploadProgressProps) => {
  const { progress, uploads } = files;

  const finished = uploads.filter(
    (upload) => upload.status !== "pending" && upload.status !== "uploading"
  ).length;

  const percent = Math.round(progress.fraction * 100);

  return (
    <>
      {uploads.length > 0 && (
        <div className={cn("flex flex-col gap-3", className)}>
          {uploads.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {finished} of {uploads.length} files finished
                </span>
                <span>{percent}%</span>
              </div>
              <Progress
                aria-label="All uploads"
                aria-valuenow={percent}
                aria-valuetext={`${finished} of ${uploads.length} files finished, ${percent}%`}
                value={progress.fraction * 100}
              />
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {uploads.map((upload, index) => (
              <UploadRow key={rowKey(upload, index)} upload={upload} />
            ))}
          </ul>
        </div>
      )}
      <div aria-live="polite" className="sr-only" role="log">
        {uploads.map((upload, index) => {
          const message = announcement(upload);

          return message === undefined ? null : (
            <span key={rowKey(upload, index)}>{message}. </span>
          );
        })}
      </div>
    </>
  );
};
