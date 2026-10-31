"use client";

import { SERIES_DURATIONS } from "@faceless/contracts";
import type { SeriesDurationOption } from "@faceless/contracts";
import { Alert, AlertDescription } from "@faceless/ui/components/alert";
import { Badge } from "@faceless/ui/components/badge";
import { Field, FieldLabel } from "@faceless/ui/components/field";
import { Input } from "@faceless/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@faceless/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@faceless/ui/components/tooltip";
import { Tiktok } from "@faceless/ui/socials";
import { Info } from "lucide-react";
import * as React from "react";

import { PageHeader } from "@/components/page-header";
import { TimePickerPopover } from "@/components/time-picker-popover";

import { useSeriesWizard } from "../_context/series-wizard-context";

export const StepEightDetails = () => {
  const {
    seriesName,
    duration,
    publishTime,
    handleChangeSeriesName,
    handleChangeDuration,
    handleChangePublishTime,
  } = useSeriesWizard();

  const selectedDurationOption = React.useMemo(
    () =>
      SERIES_DURATIONS.find((opt: SeriesDurationOption) => opt.id === duration),
    [duration]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Series Details"
        description="Finalize your series details and posting schedule"
        badge={<Badge variant="outline">Step 8 of 8</Badge>}
      />

      {/* Series Name Field */}
      <Field>
        <FieldLabel htmlFor="series-name">Series Name</FieldLabel>
        <Input
          id="series-name"
          value={seriesName}
          onChange={(event) => {
            handleChangeSeriesName(event.target.value);
          }}
          placeholder="Enter series name"
        />
      </Field>

      {/* Video Duration Field */}
      <Field>
        <div className="flex items-center gap-1.5">
          <FieldLabel htmlFor="series-duration">Video Duration</FieldLabel>
          <Tooltip>
            <TooltipTrigger>
              <span className="inline-flex cursor-pointer text-muted-foreground">
                <Info className="size-4" />
                <span className="sr-only">Video duration info</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Videos over 60 seconds can be monetized on TikTok.
            </TooltipContent>
          </Tooltip>
        </div>

        <Select
          value={duration}
          onValueChange={(val) => {
            if (val !== null && val.length > 0) {
              handleChangeDuration(val);
            }
          }}
        >
          <SelectTrigger id="series-duration" className="w-full">
            <SelectValue>
              {selectedDurationOption?.monetizable === true ? (
                <span className="flex items-center gap-2">
                  <span>{selectedDurationOption.label}</span>
                  <Badge variant="secondary">
                    <Tiktok className="size-3" />
                    Monetizable
                  </Badge>
                </span>
              ) : (
                <span>{selectedDurationOption?.label ?? duration}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SERIES_DURATIONS.map((opt: SeriesDurationOption) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.monetizable === true ? (
                    <span className="flex items-center gap-2">
                      <span>{opt.label}</span>
                      <Badge variant="secondary">
                        <Tiktok className="size-3" />
                        Monetizable
                      </Badge>
                    </span>
                  ) : (
                    <span>{opt.label}</span>
                  )}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* Schedule Section */}
      <div className="flex flex-col gap-3 pt-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Set when you want your videos to be published.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-sm font-medium text-foreground">
            Publish time:
          </span>
          <TimePickerPopover
            className="w-auto"
            currentTime={publishTime}
            onSelectTime={handleChangePublishTime}
          />
          <span className="text-sm text-muted-foreground">
            (Your local time)
          </span>
        </div>

        {/* Note callout */}
        <Alert>
          <AlertDescription>
            <span className="font-semibold text-foreground">Note:</span> Videos
            will be generated 6 hours before the scheduled publish time so you
            have time to review them.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
