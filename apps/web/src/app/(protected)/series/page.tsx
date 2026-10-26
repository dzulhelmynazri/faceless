"use client";

import { Button } from "@faceless/ui/components/button";
import { Spinner } from "@faceless/ui/components/spinner";
import { cn } from "@faceless/ui/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { SeriesWizardStepContent } from "./_components/series-wizard-step-content";
import { useSeriesWizardState } from "./_hooks/use-series-wizard-state";

interface SeriesProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const SeriesProgressBar = ({
  currentStep,
  totalSteps,
}: SeriesProgressBarProps) => (
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

interface SeriesWizardFooterProps {
  currentStep: number;
  isCreating: boolean;
  onBack: () => void;
  onContinue: () => void;
  onCreateSeries: () => void;
}

const SeriesWizardFooter = ({
  currentStep,
  isCreating,
  onBack,
  onContinue,
  onCreateSeries,
}: SeriesWizardFooterProps) => (
  <div className="flex items-center justify-between pt-2 pb-8">
    {currentStep > 1 ? (
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft data-icon="inline-start" />
        Back
      </Button>
    ) : (
      <div />
    )}

    {currentStep === 8 ? (
      <Button size="lg" disabled={isCreating} onClick={onCreateSeries}>
        {isCreating ? <Spinner /> : "Create Series"}
      </Button>
    ) : (
      <Button size="lg" onClick={onContinue}>
        Continue
        <ChevronRight data-icon="inline-end" />
      </Button>
    )}
  </div>
);

const SeriesWizard = () => {
  const wizard = useSeriesWizardState();

  return (
    <div className="flex flex-col gap-6">
      <SeriesProgressBar
        currentStep={wizard.currentStep}
        totalSteps={wizard.totalSteps}
      />

      <SeriesWizardStepContent
        currentStep={wizard.currentStep}
        selectedPresetId={wizard.selectedPresetId}
        customNiche={wizard.customNiche}
        customScript={wizard.customScript}
        onSelectPreset={wizard.handleSelectPreset}
        onChangeNiche={wizard.handleChangeNiche}
        onChangeScript={wizard.handleChangeScript}
        selectedLanguage={wizard.selectedLanguage}
        selectedVoiceId={wizard.selectedVoiceId}
        onSelectLanguage={wizard.handleSelectLanguage}
        onSelectVoice={wizard.handleSelectVoice}
        selectedTrackIds={wizard.selectedTrackIds}
        tiktokSounds={wizard.tiktokSounds}
        customMusicKey={wizard.customMusicKey}
        customMusicUrl={wizard.customMusicUrl}
        onToggleTrack={wizard.handleToggleTrack}
        onSelectAllTracks={wizard.handleSelectAllTracks}
        onClearTracks={wizard.handleClearTracks}
        onChangeTiktokSounds={wizard.handleChangeTiktokSounds}
        onChangeCustomMusic={wizard.handleChangeCustomMusic}
        onClearCustomMusic={wizard.handleClearCustomMusic}
        selectedStyleId={wizard.selectedStyleId}
        onSelectStyle={wizard.handleSelectStyle}
        selectedCaptionId={wizard.selectedCaptionId}
        onSelectCaptionStyle={wizard.handleSelectCaptionStyle}
        glitchEffect={wizard.glitchEffect}
        onToggleGlitchEffect={wizard.handleToggleGlitchEffect}
        selectedAccountsParam={wizard.selectedAccountsParam}
        onToggleAccount={wizard.handleToggleAccount}
        seriesName={wizard.seriesName}
        duration={wizard.duration}
        publishTime={wizard.publishTime}
        onChangeSeriesName={wizard.handleChangeSeriesName}
        onChangeDuration={wizard.handleChangeDuration}
        onChangePublishTime={wizard.handleChangePublishTime}
      />

      <SeriesWizardFooter
        currentStep={wizard.currentStep}
        isCreating={wizard.isCreating}
        onBack={wizard.handleBack}
        onContinue={wizard.handleContinue}
        onCreateSeries={wizard.handleCreateSeries}
      />
    </div>
  );
};

const SeriesPage = () => (
  <React.Suspense fallback={null}>
    <SeriesWizard />
  </React.Suspense>
);

export default SeriesPage;
