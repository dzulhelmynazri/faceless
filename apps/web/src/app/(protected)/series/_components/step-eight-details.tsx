"use client";

import { SERIES_DURATIONS } from "@faceless/contracts";
import type { SeriesDurationOption } from "@faceless/contracts";
import { Alert, AlertDescription } from "@faceless/ui/components/alert";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Field, FieldLabel } from "@faceless/ui/components/field";
import { Input } from "@faceless/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@faceless/ui/components/popover";
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
import { cn } from "@faceless/ui/lib/utils";
import { Tiktok } from "@faceless/ui/socials";
import { Clock, Info } from "lucide-react";
import * as React from "react";

import { useSeriesWizard } from "../_context/series-wizard-context";

const POPULAR_TIMES: readonly string[] = [
  "08:00 AM",
  "10:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
  "08:00 PM",
  "10:00 PM",
];

const HOURS: readonly string[] = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const MINUTES: readonly string[] = ["00", "15", "30", "45"];

const TimePickerPopover = ({
  currentTime,
  onSelectTime,
}: {
  currentTime: string;
  onSelectTime: (time: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  // Parse "12:00 PM"
  const [timePart, periodPart = "PM"] = currentTime.split(" ");
  const [hourPart = "12", minutePart = "00"] = (timePart ?? "12:00").split(":");

  const handleSetHour = (hour: string) => {
    onSelectTime(`${hour}:${minutePart} ${periodPart}`);
  };

  const handleSetMinute = (minute: string) => {
    onSelectTime(`${hourPart}:${minute} ${periodPart}`);
  };

  const handleSetPeriod = (period: "AM" | "PM") => {
    onSelectTime(`${hourPart}:${minutePart} ${period}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline">
            <span>{currentTime}</span>
            <Clock className="text-muted-foreground" data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="w-80" align="start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Select Publish Time
            </span>
            <div className="flex items-center rounded-lg border border-border/80 p-0.5">
              <button
                type="button"
                onClick={() => {
                  handleSetPeriod("AM");
                }}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  periodPart === "AM"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSetPeriod("PM");
                }}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  periodPart === "PM"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hour & Minute selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Hour
              </span>
              <div className="grid grid-cols-4 gap-1">
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      handleSetHour(hour);
                    }}
                    className={cn(
                      "cursor-pointer rounded-md py-1 text-center text-xs transition-colors",
                      hourPart === hour
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "bg-muted/30 text-foreground hover:bg-muted"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Minute
              </span>
              <div className="grid grid-cols-2 gap-1">
                {MINUTES.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => {
                      handleSetMinute(min);
                    }}
                    className={cn(
                      "cursor-pointer rounded-md py-1 text-center text-xs transition-colors",
                      minutePart === min
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "bg-muted/30 text-foreground hover:bg-muted"
                    )}
                  >
                    {min}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Quick presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TIMES.map((popular) => (
                <button
                  key={popular}
                  type="button"
                  onClick={() => {
                    onSelectTime(popular);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1 text-xs transition-colors",
                    currentTime === popular
                      ? "bg-primary font-medium text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {popular}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Series Details
          </h1>
          <Badge variant="outline">Step 8 of 8</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Finalize your series details and posting schedule
        </p>
      </div>

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
