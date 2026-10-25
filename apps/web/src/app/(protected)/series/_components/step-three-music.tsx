"use client";

import { SERIES_MUSIC_PRESETS } from "@faceless/contracts";
import type { SeriesMusicTrack } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card } from "@faceless/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@faceless/ui/components/empty";
import { Field, FieldLabel } from "@faceless/ui/components/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@faceless/ui/components/item";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@faceless/ui/components/tabs";
import { Textarea } from "@faceless/ui/components/textarea";
import { Layers, Pause, Play, Sparkles, Upload } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";

const MUSIC_TABS = ["presets", "custom"] as const;

const musicTabParser = parseAsStringLiteral(MUSIC_TABS).withDefault("presets");

interface StepThreeMusicProps {
  selectedTrackIds?: string[];
  selectedTrackId?: string;
  tiktokSounds: string;
  onToggleTrack: (trackId: string) => void;
  onSelectAllTracks?: (trackIds: string[]) => void;
  onClearTracks?: () => void;
  onChangeTiktokSounds: (sounds: string) => void;
}

export const StepThreeMusic = ({
  selectedTrackIds,
  selectedTrackId,
  tiktokSounds,
  onToggleTrack,
  onSelectAllTracks,
  onClearTracks,
  onChangeTiktokSounds,
}: StepThreeMusicProps) => {
  const [tab, setTab] = useQueryState("musicTab", musicTabParser);

  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(
    null
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const activeSelectedIds = React.useMemo(() => {
    if (selectedTrackIds !== undefined) {
      return selectedTrackIds;
    }

    if (selectedTrackId !== undefined && selectedTrackId !== "none") {
      return selectedTrackId.split(",").filter(Boolean);
    }

    return [];
  }, [selectedTrackIds, selectedTrackId]);

  const handleTabChange = React.useCallback(
    (value: string | null) => {
      if (value === "presets" || value === "custom") {
        void setTab(value);
      }
    },
    [setTab]
  );

  const handleTogglePlay = React.useCallback(
    (track: SeriesMusicTrack, event: React.MouseEvent) => {
      event.stopPropagation();

      const { url } = track;

      if (url === "") {
        return;
      }

      if (playingTrackId === track.id) {
        if (audioRef.current !== null) {
          audioRef.current.pause();
        }

        setPlayingTrackId(null);

        return;
      }

      if (audioRef.current !== null) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);

      audioRef.current = audio;

      setPlayingTrackId(track.id);

      audio.addEventListener(
        "ended",
        () => {
          setPlayingTrackId(null);
        },
        { once: true }
      );

      audio.addEventListener(
        "error",
        () => {
          setPlayingTrackId(null);
        },
        { once: true }
      );

      void audio.play().catch(() => {
        setPlayingTrackId(null);
      });
    },
    [playingTrackId]
  );

  React.useEffect(
    () => () => {
      if (audioRef.current !== null) {
        audioRef.current.pause();
      }
    },
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Background Music
          </h1>
          <Badge variant="outline">Step 3 of 8</Badge>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose as many songs as you want, we&apos;ll pick a random one for
          each video
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="presets">
            <Layers data-icon="inline-start" />
            Preset music
            {activeSelectedIds.length > 0 && (
              <Badge variant="secondary">{activeSelectedIds.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Sparkles data-icon="inline-start" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Preset music tab content */}
        <TabsContent value="presets" className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {activeSelectedIds.length} of {SERIES_MUSIC_PRESETS.length}{" "}
              selected
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (onSelectAllTracks) {
                    onSelectAllTracks(SERIES_MUSIC_PRESETS.map((t) => t.id));
                  }
                }}
              >
                Select all
              </Button>
              <Button
                variant="ghost"
                disabled={activeSelectedIds.length === 0}
                onClick={() => {
                  if (onClearTracks) {
                    onClearTracks();
                  }
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {SERIES_MUSIC_PRESETS.map((track: SeriesMusicTrack) => {
              const isSelected = activeSelectedIds.includes(track.id);

              const isPlaying = playingTrackId === track.id;

              return (
                <Item
                  key={track.id}
                  variant={isSelected ? "selected" : "interactive"}
                  onClick={() => {
                    onToggleTrack(track.id);
                  }}
                >
                  <ItemContent>
                    <div className="flex items-center gap-2">
                      <ItemTitle>{track.title}</ItemTitle>
                      {isSelected && (
                        <Badge variant="secondary">Selected</Badge>
                      )}
                    </div>
                    <ItemDescription>{track.description}</ItemDescription>
                  </ItemContent>

                  <ItemActions>
                    <Button
                      variant={isPlaying ? "default" : "outline"}
                      size="icon"
                      disabled={track.url === ""}
                      onClick={(event) => {
                        handleTogglePlay(track, event);
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
        </TabsContent>

        {/* Custom music tab content */}
        <TabsContent value="custom" className="mt-4">
          <div className="flex flex-col gap-6">
            <Field>
              <FieldLabel htmlFor="tiktok-sounds">
                TikTok Sound URLs (copy+paste link to TikTok sound)
              </FieldLabel>
              <Textarea
                id="tiktok-sounds"
                rows={4}
                placeholder="Enter TikTok sound URLs, one per line"
                value={tiktokSounds}
                onChange={(event) => {
                  onChangeTiktokSounds(event.target.value);
                }}
              />
            </Field>

            <Field>
              <FieldLabel>Upload custom music</FieldLabel>
              <Card>
                <Empty>
                  <EmptyMedia variant="icon">
                    <Upload />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyDescription>
                      Upload your own audio tracks (MP3, WAV, AAC) to use as
                      background music
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline">Browse files</Button>
                  </EmptyContent>
                </Empty>
              </Card>
            </Field>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
