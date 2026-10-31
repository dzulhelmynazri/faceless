"use client";

import { Button } from "@faceless/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@faceless/ui/components/popover";
import { Separator } from "@faceless/ui/components/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@faceless/ui/components/toggle-group";
import { cn } from "@faceless/ui/lib/utils";
import { Clock } from "lucide-react";
import * as React from "react";

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

export interface TimePickerPopoverProps {
  readonly currentTime: string;
  readonly onSelectTime: (time: string) => void;
  readonly id?: string;
  readonly className?: string;
}

export const TimePickerPopover = ({
  currentTime,
  onSelectTime,
  id,
  className,
}: TimePickerPopoverProps) => {
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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn("w-full justify-between", className)}
            id={id}
            variant="outline"
          >
            <span>{currentTime || "Select time"}</span>
            <Clock className="text-muted-foreground" data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-84">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <PopoverTitle>Select Publish Time</PopoverTitle>
            <ToggleGroup
              onValueChange={(val) => {
                const [next] = val;

                if (next === "AM" || next === "PM") {
                  handleSetPeriod(next);
                }
              }}
              size="sm"
              spacing={0}
              value={[periodPart]}
              variant="outline"
            >
              <ToggleGroupItem value="AM">AM</ToggleGroupItem>
              <ToggleGroupItem value="PM">PM</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Hour & Minute selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Hour
              </span>
              <div className="grid grid-cols-4 gap-1">
                {HOURS.map((hour) => (
                  <Button
                    key={hour}
                    onClick={() => {
                      handleSetHour(hour);
                    }}
                    size="sm"
                    variant={hourPart === hour ? "default" : "ghost"}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Minute
              </span>
              <div className="grid grid-cols-2 gap-1">
                {MINUTES.map((min) => (
                  <Button
                    key={min}
                    onClick={() => {
                      handleSetMinute(min);
                    }}
                    size="sm"
                    variant={minutePart === min ? "default" : "ghost"}
                  >
                    {min}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick preset buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Quick presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TIMES.map((popular) => (
                <Button
                  key={popular}
                  onClick={() => {
                    onSelectTime(popular);
                    setOpen(false);
                  }}
                  size="sm"
                  variant={currentTime === popular ? "default" : "secondary"}
                >
                  {popular}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
