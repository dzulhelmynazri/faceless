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
import { Layers, Play, Sparkles, Upload } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";

const MUSIC_TABS = ["presets", "custom"] as const;

const musicTabParser = parseAsStringLiteral(MUSIC_TABS).withDefault("presets");

interface StepThreeMusicProps {
  selectedTrackId: string;
  tiktokSounds: string;
  onSelectTrack: (trackId: string) => void;
  onChangeTiktokSounds: (sounds: string) => void;
}

export const StepThreeMusic = ({
  selectedTrackId,
  tiktokSounds,
  onSelectTrack,
  onChangeTiktokSounds,
}: StepThreeMusicProps) => {
  const [tab, setTab] = useQueryState("musicTab", musicTabParser);

  const handleTabChange = React.useCallback(
    (value: string | null) => {
      if (value === "presets" || value === "custom") {
        void setTab(value);
      }
    },
    [setTab]
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
          Choose a background music track for your video
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="presets">
            <Layers data-icon="inline-start" />
            Preset music
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Sparkles data-icon="inline-start" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Preset music tab content */}
        <TabsContent value="presets" className="mt-4">
          <div className="flex flex-col gap-3">
            {SERIES_MUSIC_PRESETS.map((track: SeriesMusicTrack) => {
              const isSelected = selectedTrackId === track.id;

              return (
                <Item
                  key={track.id}
                  variant={isSelected ? "selected" : "interactive"}
                  onClick={() => {
                    onSelectTrack(track.id);
                  }}
                >
                  <ItemContent>
                    <ItemTitle>{track.title}</ItemTitle>
                    <ItemDescription>{track.description}</ItemDescription>
                  </ItemContent>

                  <ItemActions>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <Play className="fill-current" />
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
