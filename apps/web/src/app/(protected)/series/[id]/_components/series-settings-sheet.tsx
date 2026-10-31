"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@faceless/ui/components/field";
import { Input } from "@faceless/ui/components/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemGroup,
  ItemTitle,
} from "@faceless/ui/components/item";
import { ScrollArea } from "@faceless/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@faceless/ui/components/sheet";
import { Spinner } from "@faceless/ui/components/spinner";
import { Textarea } from "@faceless/ui/components/textarea";
import { Archive, Trash2 } from "lucide-react";
import * as React from "react";

import { TimePickerPopover } from "@/components/time-picker-popover";

interface SeriesSettingsFormProps {
  readonly initialName: string;
  readonly initialPublishTime: string;
  readonly nichePrompt?: string;
  readonly status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  readonly isSaving: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: { name: string; publishTime: string }) => void;
  readonly onToggleArchive: () => void;
  readonly onOpenDeleteDialog: () => void;
}

const SeriesSettingsForm = ({
  initialName,
  initialPublishTime,
  nichePrompt,
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
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 px-6 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="series-name-input">Series Name</FieldLabel>
              <Input
                id="series-name-input"
                onChange={(e) => {
                  setNameInput(e.target.value);
                }}
                value={nameInput}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="publish-time-picker">
                Scheduled Publish Time
              </FieldLabel>
              <TimePickerPopover
                currentTime={publishTimeInput}
                id="publish-time-picker"
                onSelectTime={setPublishTimeInput}
              />
              <FieldDescription>
                Episodes trigger automated generation 2 hours before this time.
              </FieldDescription>
            </Field>

            {Boolean(nichePrompt) && (
              <Field>
                <FieldLabel htmlFor="series-prompt-preview">
                  Generation Concept &amp; Prompt
                </FieldLabel>
                <Textarea
                  className="max-h-36 cursor-move resize-none"
                  id="series-prompt-preview"
                  readOnly
                  rows={4}
                  value={nichePrompt}
                />
              </Field>
            )}
          </FieldGroup>
          <ItemSeparator />
          <ItemGroup>
            <Item size="xs" variant="outline">
              <ItemContent>
                <ItemTitle>
                  {status === "ARCHIVED"
                    ? "Unarchive Series"
                    : "Archive Series"}
                </ItemTitle>
                <ItemDescription>
                  {status === "ARCHIVED"
                    ? "Resumes generation and restores the series."
                    : "Pauses generation and hides the series."}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button onClick={onToggleArchive} variant="outline">
                  <Archive data-icon="inline-start" />
                  {status === "ARCHIVED" ? "Unarchive" : "Archive"}
                </Button>
              </ItemActions>
            </Item>

            <Item size="xs" variant="outline">
              <ItemContent>
                <ItemTitle>Delete Series</ItemTitle>
                <ItemDescription>
                  Permanently remove this series and all episodes.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button onClick={onOpenDeleteDialog} variant="destructive">
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </div>
      </ScrollArea>

      <SheetFooter className="flex-col-reverse sm:flex-row sm:justify-end">
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving && <Spinner data-icon="inline-start" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </SheetFooter>
    </>
  );
};

export interface SeriesSettingsSheetProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly initialName: string;
  readonly initialPublishTime: string;
  readonly nichePrompt?: string;
  readonly status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  readonly isSaving: boolean;
  readonly onSave: (data: { name: string; publishTime: string }) => void;
  readonly onToggleArchive: () => void;
  readonly onOpenDeleteDialog: () => void;
}

export const SeriesSettingsSheet = ({
  isOpen,
  onOpenChange,
  initialName,
  initialPublishTime,
  nichePrompt,
  status,
  isSaving,
  onSave,
  onToggleArchive,
  onOpenDeleteDialog,
}: SeriesSettingsSheetProps) => (
  <Sheet onOpenChange={onOpenChange} open={isOpen}>
    <SheetContent className="min-w-md overflow-hidden">
      <SheetHeader>
        <SheetTitle>Series Settings</SheetTitle>
        <SheetDescription>
          Update your series configuration and schedule.
        </SheetDescription>
      </SheetHeader>

      {isOpen && (
        <SeriesSettingsForm
          initialName={initialName}
          initialPublishTime={initialPublishTime}
          isSaving={isSaving}
          key={`${initialName}-${initialPublishTime}`}
          nichePrompt={nichePrompt}
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
    </SheetContent>
  </Sheet>
);
