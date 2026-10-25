"use client";

import {
  SERIES_ART_STYLES,
  SERIES_LANGUAGES,
  SERIES_MUSIC_PRESETS,
  SERIES_PRESETS,
  SERIES_VOICES,
} from "@faceless/contracts";
import { Button } from "@faceless/ui/components/button";
import { cn } from "@faceless/ui/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import * as React from "react";
import { toast } from "sonner";

import { SeriesWizardStepContent } from "./_components/series-wizard-step-content";

const TOTAL_STEPS = 8;

const [DEFAULT_PRESET] = SERIES_PRESETS;
const [DEFAULT_LANGUAGE] = SERIES_LANGUAGES;
const [DEFAULT_VOICE] = SERIES_VOICES;
const [DEFAULT_TRACK] = SERIES_MUSIC_PRESETS;
const [DEFAULT_ART_STYLE] = SERIES_ART_STYLES;

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
  onBack: () => void;
  onContinue: () => void;
  onCreateSeries: () => void;
}

const SeriesWizardFooter = ({
  currentStep,
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
      <Button size="lg" onClick={onCreateSeries}>
        Create Series
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
  const [currentStep, setCurrentStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1)
  );

  // Step 1 state
  const [selectedPresetId, setSelectedPresetId] = useQueryState(
    "preset",
    parseAsString.withDefault(DEFAULT_PRESET.id)
  );

  const [customNiche, setCustomNiche] = React.useState<string>(
    DEFAULT_PRESET.nichePrompt
  );

  const [customScript, setCustomScript] = React.useState<string>(
    DEFAULT_PRESET.exampleScript
  );

  // Step 2 state
  const [selectedLanguage, setSelectedLanguage] = useQueryState(
    "lang",
    parseAsString.withDefault(DEFAULT_LANGUAGE.code)
  );

  const [selectedVoiceId, setSelectedVoiceId] = useQueryState(
    "voice",
    parseAsString.withDefault(DEFAULT_VOICE.id)
  );

  // Step 3 state
  const [selectedTrackId, setSelectedTrackId] = useQueryState(
    "music",
    parseAsString.withDefault(DEFAULT_TRACK.id)
  );

  const [tiktokSounds, setTiktokSounds] = useQueryState(
    "tiktokSounds",
    parseAsString.withDefault("")
  );

  // Step 4 state
  const [selectedStyleId, setSelectedStyleId] = useQueryState(
    "style",
    parseAsString.withDefault(DEFAULT_ART_STYLE.id)
  );

  // Step 5 state
  const [selectedCaptionId, setSelectedCaptionId] = useQueryState(
    "caption",
    parseAsString.withDefault("sleek")
  );

  // Step 6 state
  const [glitchEffect, setGlitchEffect] = useQueryState(
    "glitch",
    parseAsBoolean.withDefault(true)
  );

  // Step 7 state
  const [selectedAccountsParam, setSelectedAccountsParam] = useQueryState(
    "accounts",
    parseAsString.withDefault("__ALL__")
  );

  // Step 8 state
  const [seriesName, setSeriesName] = useQueryState(
    "name",
    parseAsString.withDefault("test")
  );

  const [duration, setDuration] = useQueryState(
    "duration",
    parseAsString.withDefault("30-40")
  );

  const [publishTime, setPublishTime] = useQueryState(
    "publishTime",
    parseAsString.withDefault("12:00 PM")
  );

  const handleSelectPreset = React.useCallback(
    (id: string) => {
      void setSelectedPresetId(id);
      const preset = SERIES_PRESETS.find((item) => item.id === id);

      if (preset) {
        setCustomNiche(preset.nichePrompt);
        setCustomScript(preset.exampleScript);
      }
    },
    [setSelectedPresetId]
  );

  const handleSelectLanguage = React.useCallback(
    (language: string) => {
      void setSelectedLanguage(language);
    },
    [setSelectedLanguage]
  );

  const handleSelectVoice = React.useCallback(
    (voiceId: string) => {
      void setSelectedVoiceId(voiceId);
    },
    [setSelectedVoiceId]
  );

  const handleSelectTrack = React.useCallback(
    (trackId: string) => {
      void setSelectedTrackId(trackId);
    },
    [setSelectedTrackId]
  );

  const handleChangeTiktokSounds = React.useCallback(
    (sounds: string) => {
      void setTiktokSounds(sounds);
    },
    [setTiktokSounds]
  );

  const handleSelectStyle = React.useCallback(
    (styleId: string) => {
      void setSelectedStyleId(styleId);
    },
    [setSelectedStyleId]
  );

  const handleSelectCaptionStyle = React.useCallback(
    (captionId: string) => {
      void setSelectedCaptionId(captionId);
    },
    [setSelectedCaptionId]
  );

  const handleToggleGlitchEffect = React.useCallback(
    (checked: boolean) => {
      void setGlitchEffect(checked);
    },
    [setGlitchEffect]
  );

  const handleToggleAccount = React.useCallback(
    (id: string, checked: boolean, allIds: string[]) => {
      let currentList: string[] = [];

      if (selectedAccountsParam === "__ALL__") {
        currentList = allIds;
      } else if (
        selectedAccountsParam !== "none" &&
        selectedAccountsParam.length > 0
      ) {
        currentList = selectedAccountsParam.split(",").filter(Boolean);
      }

      const next = checked
        ? [...new Set([...currentList, id])]
        : currentList.filter((item) => item !== id);

      const nextParam = next.length === 0 ? "none" : next.join(",");
      void setSelectedAccountsParam(nextParam);
    },
    [selectedAccountsParam, setSelectedAccountsParam]
  );

  const handleChangeSeriesName = React.useCallback(
    (name: string) => {
      void setSeriesName(name);
    },
    [setSeriesName]
  );

  const handleChangeDuration = React.useCallback(
    (nextDuration: string) => {
      void setDuration(nextDuration);
    },
    [setDuration]
  );

  const handleChangePublishTime = React.useCallback(
    (time: string) => {
      void setPublishTime(time);
    },
    [setPublishTime]
  );

  const handleCreateSeries = React.useCallback(() => {
    toast.success("Series created successfully!");
  }, []);

  const handleContinue = React.useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      void setCurrentStep(currentStep + 1);
    }
  }, [currentStep, setCurrentStep]);

  const handleBack = React.useCallback(() => {
    if (currentStep > 1) {
      void setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  return (
    <div className="flex flex-col gap-6">
      <SeriesProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <SeriesWizardStepContent
        currentStep={currentStep}
        selectedPresetId={selectedPresetId}
        customNiche={customNiche}
        customScript={customScript}
        onSelectPreset={handleSelectPreset}
        onChangeNiche={setCustomNiche}
        onChangeScript={setCustomScript}
        selectedLanguage={selectedLanguage}
        selectedVoiceId={selectedVoiceId}
        onSelectLanguage={handleSelectLanguage}
        onSelectVoice={handleSelectVoice}
        selectedTrackId={selectedTrackId}
        tiktokSounds={tiktokSounds}
        onSelectTrack={handleSelectTrack}
        onChangeTiktokSounds={handleChangeTiktokSounds}
        selectedStyleId={selectedStyleId}
        onSelectStyle={handleSelectStyle}
        selectedCaptionId={selectedCaptionId}
        onSelectCaptionStyle={handleSelectCaptionStyle}
        glitchEffect={glitchEffect}
        onToggleGlitchEffect={handleToggleGlitchEffect}
        selectedAccountsParam={selectedAccountsParam}
        onToggleAccount={handleToggleAccount}
        seriesName={seriesName}
        duration={duration}
        publishTime={publishTime}
        onChangeSeriesName={handleChangeSeriesName}
        onChangeDuration={handleChangeDuration}
        onChangePublishTime={handleChangePublishTime}
      />

      <SeriesWizardFooter
        currentStep={currentStep}
        onBack={handleBack}
        onContinue={handleContinue}
        onCreateSeries={handleCreateSeries}
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
