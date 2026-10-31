"use client";

import { cn } from "@faceless/ui/lib/utils";

import { useSeriesWizard } from "../_context/series-wizard-context";

export const SeriesProgressBar = () => {
  const { currentStep, totalSteps } = useSeriesWizard();

  return (
    <div className="grid grid-cols-8 gap-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-colors",
            index < currentStep ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
};
