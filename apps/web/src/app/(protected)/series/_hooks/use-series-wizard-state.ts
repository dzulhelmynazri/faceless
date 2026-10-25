"use client";

import {
  SERIES_ART_STYLES,
  SERIES_LANGUAGES,
  SERIES_MUSIC_PRESETS,
  SERIES_PRESETS,
  SERIES_VOICES,
} from "@faceless/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

export const TOTAL_STEPS = 8;

const [DEFAULT_PRESET] = SERIES_PRESETS;
const [DEFAULT_LANGUAGE] = SERIES_LANGUAGES;
const [DEFAULT_VOICE] = SERIES_VOICES;
const [DEFAULT_TRACK] = SERIES_MUSIC_PRESETS;
const [DEFAULT_ART_STYLE] = SERIES_ART_STYLES;

export const useSeriesWizardState = () => {
  const router = useRouter();

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
    () =>
      SERIES_PRESETS.find((item) => item.id === selectedPresetId)
        ?.nichePrompt ?? DEFAULT_PRESET.nichePrompt
  );

  const [customScript, setCustomScript] = React.useState<string>(
    () =>
      SERIES_PRESETS.find((item) => item.id === selectedPresetId)
        ?.exampleScript ?? DEFAULT_PRESET.exampleScript
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
    parseAsString.withDefault(DEFAULT_PRESET.title)
  );

  const [duration, setDuration] = useQueryState(
    "duration",
    parseAsString.withDefault("30-40")
  );

  const [publishTime, setPublishTime] = useQueryState(
    "publishTime",
    parseAsString.withDefault("12:00 PM")
  );

  const queryClient = useQueryClient();

  const createSeriesMutation = useMutation(
    trpc.series.create.mutationOptions({
      onSuccess: async ({ name }) => {
        toast.success(`Series "${name}" created successfully!`);
        await Promise.all([
          queryClient.invalidateQueries(trpc.series.list.queryFilter()),
          queryClient.invalidateQueries(
            trpc.billing.checkSeriesEntitlement.queryFilter()
          ),
        ]);
        router.push("/series");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleSelectPreset = React.useCallback(
    (id: string) => {
      void setSelectedPresetId(id);

      const preset = SERIES_PRESETS.find((item) => item.id === id);

      if (preset) {
        setCustomNiche(preset.nichePrompt);
        setCustomScript(preset.exampleScript);
        void setSeriesName(preset.title);
      }
    },
    [setSelectedPresetId, setSeriesName]
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
    let resolvedAccountIds: string[] = [];

    if (selectedAccountsParam === "__ALL__") {
      resolvedAccountIds = ["__ALL__"];
    } else if (
      selectedAccountsParam !== "none" &&
      selectedAccountsParam.length > 0
    ) {
      resolvedAccountIds = selectedAccountsParam.split(",").filter(Boolean);
    }

    createSeriesMutation.mutate({
      name: seriesName,
      nichePresetId: selectedPresetId,
      nichePrompt: customNiche,
      exampleScript: customScript.length > 0 ? customScript : undefined,
      language: selectedLanguage,
      voiceId: selectedVoiceId,
      musicTrackId: selectedTrackId.length > 0 ? selectedTrackId : undefined,
      tiktokSounds: tiktokSounds.length > 0 ? tiktokSounds : undefined,
      artStyleId: selectedStyleId,
      captionStyleId: selectedCaptionId,
      glitchEffect,
      videoDuration: duration,
      publishTime,
      socialConnectionIds: resolvedAccountIds,
    });
  }, [
    selectedAccountsParam,
    createSeriesMutation,
    seriesName,
    selectedPresetId,
    customNiche,
    customScript,
    selectedLanguage,
    selectedVoiceId,
    selectedTrackId,
    tiktokSounds,
    selectedStyleId,
    selectedCaptionId,
    glitchEffect,
    duration,
    publishTime,
  ]);

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

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    isCreating: createSeriesMutation.isPending,
    // Step 1
    selectedPresetId,
    customNiche,
    customScript,
    handleSelectPreset,
    handleChangeNiche: setCustomNiche,
    handleChangeScript: setCustomScript,
    // Step 2
    selectedLanguage,
    selectedVoiceId,
    handleSelectLanguage,
    handleSelectVoice,
    // Step 3
    selectedTrackId,
    tiktokSounds,
    handleSelectTrack,
    handleChangeTiktokSounds,
    // Step 4
    selectedStyleId,
    handleSelectStyle,
    // Step 5
    selectedCaptionId,
    handleSelectCaptionStyle,
    // Step 6
    glitchEffect,
    handleToggleGlitchEffect,
    // Step 7
    selectedAccountsParam,
    handleToggleAccount,
    // Step 8
    seriesName,
    duration,
    publishTime,
    handleChangeSeriesName,
    handleChangeDuration,
    handleChangePublishTime,
    // Navigation
    handleContinue,
    handleBack,
    handleCreateSeries,
  };
};
