"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@faceless/ui/components/dialog";
import { Input } from "@faceless/ui/components/input";
import { Label } from "@faceless/ui/components/label";
import { Archive, Trash2 } from "lucide-react";
import * as React from "react";

interface SeriesSettingsFormProps {
  initialName: string;
  initialPublishTime: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: { name: string; publishTime: string }) => void;
  onToggleArchive: () => void;
  onOpenDeleteDialog: () => void;
}

const SeriesSettingsForm = ({
  initialName,
  initialPublishTime,
  status,
  isSaving,
  onClose,
  onSave,
  onToggleArchive,
  onOpenDeleteDialog,
}: SeriesSettingsFormProps) => {
  const [nameInput, setNameInput] = React.useState(initialName);

  const [publishTimeInput, setPublishTimeInput] =
    React.useState(initialPublishTime);

  const handleSave = () => {
    onSave({ name: nameInput, publishTime: publishTimeInput });
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="series-name-input">Series Name</Label>
          <Input
            id="series-name-input"
            onChange={(e) => {
              setNameInput(e.target.value);
            }}
            value={nameInput}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publish-time-input">Scheduled Publish Time</Label>
          <Input
            id="publish-time-input"
            onChange={(e) => {
              setPublishTimeInput(e.target.value);
            }}
            value={publishTimeInput}
          />
          <span className="text-xs text-muted-foreground">
            Episodes trigger automated generation 2 hours before this time.
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Archive Series</span>
            <span className="text-xs text-muted-foreground">
              Stops crons and hides series from active view.
            </span>
          </div>
          <Button onClick={onToggleArchive} size="sm" variant="outline">
            <span className="flex items-center gap-1.5">
              <Archive className="size-3.5" />
              {status === "ARCHIVED" ? "Unarchive" : "Archive"}
            </span>
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-destructive">
              Delete Series
            </span>
            <span className="text-xs text-muted-foreground">
              Permanently remove this series and all episodes.
            </span>
          </div>
          <Button onClick={onOpenDeleteDialog} size="sm" variant="destructive">
            <span className="flex items-center gap-1.5">
              <Trash2 className="size-3.5" />
              Delete
            </span>
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button disabled={isSaving} onClick={handleSave}>
          Save Changes
        </Button>
      </DialogFooter>
    </>
  );
};

interface SeriesSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialPublishTime: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  isSaving: boolean;
  onSave: (data: { name: string; publishTime: string }) => void;
  onToggleArchive: () => void;
  onOpenDeleteDialog: () => void;
}

export const SeriesSettingsDialog = ({
  isOpen,
  onOpenChange,
  initialName,
  initialPublishTime,
  status,
  isSaving,
  onSave,
  onToggleArchive,
  onOpenDeleteDialog,
}: SeriesSettingsDialogProps) => (
  <Dialog onOpenChange={onOpenChange} open={isOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Series Settings</DialogTitle>
        <DialogDescription>
          Update your series configuration and schedule.
        </DialogDescription>
      </DialogHeader>

      {isOpen && (
        <SeriesSettingsForm
          initialName={initialName}
          initialPublishTime={initialPublishTime}
          isSaving={isSaving}
          key={`${initialName}-${initialPublishTime}`}
          onClose={() => {
            onOpenChange(false);
          }}
          onOpenDeleteDialog={() => {
            onOpenChange(false);
            onOpenDeleteDialog();
          }}
          onSave={onSave}
          onToggleArchive={onToggleArchive}
          status={status}
        />
      )}
    </DialogContent>
  </Dialog>
);
