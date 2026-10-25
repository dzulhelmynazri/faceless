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

const GENDER_TABS = ["all", "male", "female"] as const;

const genderTabParser = parseAsStringLiteral(GENDER_TABS).withDefault("all");

interface StepTwoVoiceProps {
  selectedLanguage: string;
  selectedVoiceId: string;
  onSelectLanguage: (language: string) => void;
  onSelectVoice: (voiceId: string) => void;
}

export const StepTwoVoice = ({
  selectedLanguage,
  selectedVoiceId,
  onSelectLanguage,
  onSelectVoice,
}: StepTwoVoiceProps) => {
  const [genderFilter, setGenderFilter] = useQueryState(
    "gender",
    genderTabParser
  );

  const [playingVoiceId, setPlayingVoiceId] = React.useState<string | null>(
    null
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const filteredVoices = React.useMemo(() => {
    const list = SERIES_VOICES.filter((voice: SeriesVoice) => {
      if (genderFilter !== "all" && voice.gender !== genderFilter) {
        return false;
      }

      return true;
    });

    return list.toSorted((a, b) => {
      const aMatches = a.language === selectedLanguage ? 1 : 0;
      const bMatches = b.language === selectedLanguage ? 1 : 0;

      return bMatches - aMatches;
    });
  }, [genderFilter, selectedLanguage]);

  const maleCount = React.useMemo(
    () =>
      SERIES_VOICES.filter((voice: SeriesVoice) => voice.gender === "male")
        .length,
    []
  );

  const femaleCount = React.useMemo(
    () =>
      SERIES_VOICES.filter((voice: SeriesVoice) => voice.gender === "female")
        .length,
    []
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
        onSelectLanguage(value);
      }
    },
    [onSelectLanguage]
  );

  const handleTogglePlay = React.useCallback(
    (voice: SeriesVoice, event: React.MouseEvent) => {
      event.stopPropagation();

      const { sampleUrl } = voice;

      if (sampleUrl === undefined || sampleUrl === "") {
        return;
      }

      if (playingVoiceId === voice.id) {
        audioRef.current?.pause();
        setPlayingVoiceId(null);

        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(sampleUrl);
      audioRef.current = audio;
      setPlayingVoiceId(voice.id);

      audio.addEventListener(
        "ended",
        () => {
          setPlayingVoiceId(null);
        },
        { once: true }
      );

      audio.addEventListener(
        "error",
        () => {
          setPlayingVoiceId(null);
        },
        { once: true }
      );

      void audio.play().catch(() => {
        setPlayingVoiceId(null);
      });
    },
    [playingVoiceId]
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
            <TabsTrigger value="all">All {SERIES_VOICES.length}</TabsTrigger>
            <TabsTrigger value="male">Male {maleCount}</TabsTrigger>
            <TabsTrigger value="female">Female {femaleCount}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Voice Cards Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVoices.map((voice: SeriesVoice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;

            return (
              <Item
                key={voice.id}
                variant={isSelected ? "selected" : "interactive"}
                onClick={() => {
                  onSelectVoice(voice.id);
                }}
              >
                <ItemContent>
                  <ItemTitle>{voice.name}</ItemTitle>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary">{voice.tag}</Badge>
                    {voice.language !== undefined && voice.language !== "" ? (
                      <Badge variant="outline">
                        {voice.language.toUpperCase()}
                      </Badge>
                    ) : null}
                  </div>
                </ItemContent>

                <ItemActions>
                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="icon"
                    disabled={
                      voice.sampleUrl === undefined || voice.sampleUrl === ""
                    }
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
