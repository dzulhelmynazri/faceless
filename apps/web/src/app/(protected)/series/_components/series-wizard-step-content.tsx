"use client";

import * as React from "react";

import { StepEightDetails } from "./step-eight-details";
import { StepFiveCaptionStyle } from "./step-five-caption-style";
import { StepFourArtStyle } from "./step-four-art-style";
import { StepOneNiche } from "./step-one-niche";
import { StepSevenSocialAccounts } from "./step-seven-social-accounts";
import { StepSixEffects } from "./step-six-effects";
import { StepThreeMusic } from "./step-three-music";
import { StepTwoVoice } from "./step-two-voice";

interface SeriesWizardStepContentProps {
  currentStep: number;
  // Step 1
  selectedPresetId: string;
  customNiche: string;
  customScript: string;
  onSelectPreset: (id: string) => void;
  onChangeNiche: (niche: string) => void;
  onChangeScript: (script: string) => void;
  // Step 2
  selectedLanguage: string;
  selectedVoiceId: string;
  onSelectLanguage: (lang: string) => void;
  onSelectVoice: (voiceId: string) => void;
  // Step 3
  selectedTrackIds: string[];
  tiktokSounds: string;
  customMusicKey: string;
  customMusicUrl: string;
  onToggleTrack: (trackId: string) => void;
  onSelectAllTracks: (trackIds: string[]) => void;
  onClearTracks: () => void;
  onChangeTiktokSounds: (sounds: string) => void;
  onChangeCustomMusic: (data: { key: string; url: string }) => void;
  onClearCustomMusic: () => void;
  // Step 4
  selectedStyleId: string;
  onSelectStyle: (styleId: string) => void;
  // Step 5
  selectedCaptionId: string;
  onSelectCaptionStyle: (captionId: string) => void;
  // Step 6
  glitchEffect: boolean;
  onToggleGlitchEffect: (checked: boolean) => void;
  // Step 7
  selectedAccountsParam: string;
  onToggleAccount: (id: string, checked: boolean, allIds: string[]) => void;
  // Step 8
  seriesName: string;
  duration: string;
  publishTime: string;
  onChangeSeriesName: (name: string) => void;
  onChangeDuration: (duration: string) => void;
  onChangePublishTime: (time: string) => void;
}

export const SeriesWizardStepContent = ({
  currentStep,
  selectedPresetId,
  customNiche,
  customScript,
  onSelectPreset,
  onChangeNiche,
  onChangeScript,
  selectedLanguage,
  selectedVoiceId,
  onSelectLanguage,
  onSelectVoice,
  selectedTrackIds,
  tiktokSounds,
  customMusicKey,
  customMusicUrl,
  onToggleTrack,
  onSelectAllTracks,
  onClearTracks,
  onChangeTiktokSounds,
  onChangeCustomMusic,
  onClearCustomMusic,
  selectedStyleId,
  onSelectStyle,
  selectedCaptionId,
  onSelectCaptionStyle,
  glitchEffect,
  onToggleGlitchEffect,
  selectedAccountsParam,
  onToggleAccount,
  seriesName,
  duration,
  publishTime,
  onChangeSeriesName,
  onChangeDuration,
  onChangePublishTime,
}: SeriesWizardStepContentProps) => {
  if (currentStep === 1) {
    return (
      <StepOneNiche
        selectedPresetId={selectedPresetId}
        customNiche={customNiche}
        customScript={customScript}
        onSelectPreset={onSelectPreset}
        onChangeNiche={onChangeNiche}
        onChangeScript={onChangeScript}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <StepTwoVoice
        selectedLanguage={selectedLanguage}
        selectedVoiceId={selectedVoiceId}
        onSelectLanguage={onSelectLanguage}
        onSelectVoice={onSelectVoice}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <StepThreeMusic
        selectedTrackIds={selectedTrackIds}
        tiktokSounds={tiktokSounds}
        customMusicKey={customMusicKey}
        customMusicUrl={customMusicUrl}
        onToggleTrack={onToggleTrack}
        onSelectAllTracks={onSelectAllTracks}
        onClearTracks={onClearTracks}
        onChangeTiktokSounds={onChangeTiktokSounds}
        onChangeCustomMusic={onChangeCustomMusic}
        onClearCustomMusic={onClearCustomMusic}
      />
    );
  }

  if (currentStep === 4) {
    return (
      <StepFourArtStyle
        selectedStyleId={selectedStyleId}
        onSelectStyle={onSelectStyle}
      />
    );
  }

  if (currentStep === 5) {
    return (
      <StepFiveCaptionStyle
        selectedCaptionId={selectedCaptionId}
        onSelectCaptionStyle={onSelectCaptionStyle}
      />
    );
  }

  if (currentStep === 6) {
    return (
      <StepSixEffects
        glitchEffect={glitchEffect}
        onToggleGlitchEffect={onToggleGlitchEffect}
      />
    );
  }

  if (currentStep === 7) {
    return (
      <StepSevenSocialAccounts
        selectedAccountsParam={selectedAccountsParam}
        onToggleAccount={onToggleAccount}
      />
    );
  }

  if (currentStep === 8) {
    return (
      <StepEightDetails
        seriesName={seriesName}
        duration={duration}
        publishTime={publishTime}
        onChangeSeriesName={onChangeSeriesName}
        onChangeDuration={onChangeDuration}
        onChangePublishTime={onChangePublishTime}
      />
    );
  }

  return null;
};
