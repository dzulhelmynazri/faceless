"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { AutumnBillingPanel } from "@/components/autumn-billing-panel";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  DropzoneError,
} from "@/components/files-sdk/dropzone";
import { FileList } from "@/components/files-sdk/file-list";
import { Recovery } from "@/components/files-sdk/recovery";
import { UploadProgress } from "@/components/files-sdk/upload-progress";
import type { authClient } from "@/lib/auth-client";
import { useAppFiles } from "@/lib/files-client";
import { trpc } from "@/utils/trpc";

const Test = ({
  session: _session,
}: {
  session: typeof authClient.$Infer.Session;
}) => {
  const privateData = useQuery(trpc.privateData.queryOptions());
  const files = useAppFiles();
  const [listKey, setListKey] = React.useState(0);
  const [selectedKey, setSelectedKey] = React.useState<string | undefined>();

  const handleRefresh = React.useCallback(() => {
    setListKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        API: {privateData.data?.message}
      </p>

      <div className="flex max-w-2xl flex-col gap-6">
        <AutumnBillingPanel />
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Dropzone
            accept="image/*,video/*,application/pdf"
            files={files}
            maxFiles={10}
            maxSize={15 * 1024 * 1024}
            onUploaded={handleRefresh}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
            <DropzoneError />
          </Dropzone>

          <UploadProgress files={files} />
        </div>

        <FileList
          key={listKey}
          files={files}
          onChanged={handleRefresh}
          onSelect={(file) => {
            setSelectedKey(file.key);
          }}
        />

        <Recovery
          fileKey={selectedKey}
          files={files}
          onChanged={handleRefresh}
        />
      </div>
    </div>
  );
};

export default Test;
