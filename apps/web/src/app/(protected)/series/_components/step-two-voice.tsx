"use client";

import { SERIES_LANGUAGES, SERIES_VOICES } from "@faceless/contracts";
import type { SeriesLanguage, SeriesVoice } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Field, FieldLabel } from "@faceless/ui/components/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@faceless/ui/components/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@faceless/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@faceless/ui/components/tabs";
import { Pause, Play } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";

import { useSeriesWizard } from "../_context/series-wizard-context";

const GENDER_TABS = ["all", "male", "female"] as const;

const genderTabParser = parseAsStringLiteral(GENDER_TABS).withDefault("all");

export const StepTwoVoice = () => {
  const {
    selectedLanguage,
    selectedVoiceId,
    handleSelectLanguage,
    handleSelectVoice,
  } = useSeriesWizard();

  const [genderFilter, setGenderFilter] = useQueryState(
    "gender",
    genderTabParser
  );

  const [playingVoiceKey, setPlayingVoiceKey] = React.useState<string | null>(
    null
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentLanguageVoices = React.useMemo(() => {
    const list = SERIES_VOICES.filter(
      (voice: SeriesVoice) => voice.language === selectedLanguage
    );

    return list.length > 0 ? list : SERIES_VOICES;
  }, [selectedLanguage]);

  const filteredVoices = React.useMemo(() => {
    if (genderFilter === "all") {
      return currentLanguageVoices;
    }

    return currentLanguageVoices.filter(
      (voice: SeriesVoice) => voice.gender === genderFilter
    );
  }, [currentLanguageVoices, genderFilter]);

  const maleCount = React.useMemo(
    () =>
      currentLanguageVoices.filter(
        (voice: SeriesVoice) => voice.gender === "male"
      ).length,
    [currentLanguageVoices]
  );

  const femaleCount = React.useMemo(
    () =>
      currentLanguageVoices.filter(
        (voice: SeriesVoice) => voice.gender === "female"
      ).length,
    [currentLanguageVoices]
  );

  const handleGenderFilterChange = React.useCallback(
    (value: string | null) => {
      if (value === "all" || value === "male" || value === "female") {
        void setGenderFilter(value);
      }
    },
    [setGenderFilter]
  );

  const handleLanguageChange = React.useCallback(
    (value: string | null) => {
      if (value !== null && value !== "") {
        handleSelectLanguage(value);

        const matchingVoice = SERIES_VOICES.find(
          (voice: SeriesVoice) => voice.language === value
        );

        if (matchingVoice !== undefined) {
          handleSelectVoice(matchingVoice.id);
        }
      }
    },
    [handleSelectLanguage, handleSelectVoice]
  );

  const handleTogglePlay = React.useCallback(
    (voice: SeriesVoice, event: React.MouseEvent) => {
      event.stopPropagation();

      const { sampleUrl } = voice;

      if (sampleUrl === "") {
        return;
      }

      const voiceKey = `${voice.language}-${voice.name}`;

      if (playingVoiceKey === voiceKey) {
        audioRef.current?.pause();
        setPlayingVoiceKey(null);

        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(sampleUrl);
      audioRef.current = audio;
      setPlayingVoiceKey(voiceKey);

      audio.addEventListener(
        "ended",
        () => {
          setPlayingVoiceKey(null);
        },
        { once: true }
      );

      audio.addEventListener(
        "error",
        () => {
          setPlayingVoiceKey(null);
        },
        { once: true }
      );

      void audio.play().catch(() => {
        setPlayingVoiceKey(null);
      });
    },
    [playingVoiceKey]
  );

  React.useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    []
  );

  const selectedLang = React.useMemo(
    () => SERIES_LANGUAGES.find((lang) => lang.code === selectedLanguage),
    [selectedLanguage]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Language & Voice
          </h1>
          <Badge variant="outline">Step 2 of 8</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose the language and voice style for your video
        </p>
      </div>

      {/* Language Field */}
      <Field>
        <FieldLabel htmlFor="series-language">Language</FieldLabel>
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger id="series-language" className="w-full">
            <SelectValue>
              {selectedLang ? (
                <span className="flex items-center gap-2">
                  <span>{selectedLang.flag}</span>
                  <span>{selectedLang.label}</span>
                </span>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SERIES_LANGUAGES.map((lang: SeriesLanguage) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* Voice Selection */}
      <div className="flex flex-col gap-3">
        <FieldLabel>Voice</FieldLabel>

        {/* Gender filter pill tabs */}
        <Tabs value={genderFilter} onValueChange={handleGenderFilterChange}>
          <TabsList>
            <TabsTrigger value="all">
              All {currentLanguageVoices.length}
            </TabsTrigger>
            <TabsTrigger value="male">Male {maleCount}</TabsTrigger>
            <TabsTrigger value="female">Female {femaleCount}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Voice Cards Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVoices.map((voice: SeriesVoice) => {
            const isSelected = selectedVoiceId === voice.id;

            const isPlaying =
              playingVoiceKey === `${voice.language}-${voice.name}`;

            return (
              <Item
                key={`${voice.language}-${voice.id}-${voice.name}`}
                variant={isSelected ? "selected" : "interactive"}
                onClick={() => {
                  handleSelectVoice(voice.id);
                }}
              >
                <ItemContent>
                  <div className="flex items-center gap-1.5">
                    <ItemTitle>{voice.name}</ItemTitle>
                    <span className="text-sm">{voice.flag}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary">{voice.tag}</Badge>
                  </div>
                </ItemContent>

                <ItemActions>
                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="icon"
                    disabled={voice.sampleUrl === ""}
                    onClick={(event) => {
                      handleTogglePlay(voice, event);
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="fill-current" />
                    ) : (
                      <Play className="fill-current" />
                    )}
                  </Button>
                </ItemActions>
              </Item>
            );
          })}
        </div>
      </div>
    </div>
  );
};
