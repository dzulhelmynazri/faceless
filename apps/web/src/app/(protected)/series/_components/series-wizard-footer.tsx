"use client";

import { Button } from "@faceless/ui/components/button";
import { Spinner } from "@faceless/ui/components/spinner";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { useSeriesWizard } from "../_context/series-wizard-context";

export const SeriesWizardFooter = () => {
  const {
    currentStep,
    isCreating,
    handleBack,
    handleContinue,
    handleCreateSeries,
  } = useSeriesWizard();

  return (
    <div className="flex items-center justify-between pt-2 pb-8">
      {currentStep > 1 ? (
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
      ) : (
        <div />
      )}

      {currentStep === 8 ? (
        <Button size="lg" disabled={isCreating} onClick={handleCreateSeries}>
          {isCreating ? <Spinner /> : "Create Series"}
        </Button>
      ) : (
        <Button size="lg" onClick={handleContinue}>
          Continue
          <ChevronRight data-icon="inline-end" />
        </Button>
      )}
    </div>
  );
};
