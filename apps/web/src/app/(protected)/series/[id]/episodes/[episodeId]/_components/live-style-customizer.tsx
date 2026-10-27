"use client";

import {
  SERIES_CAPTION_STYLES,
  SERIES_MUSIC_PRESETS,
} from "@faceless/contracts/series";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { Label } from "@faceless/ui/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@faceless/ui/components/native-select";
import { Spinner } from "@faceless/ui/components/spinner";
import { Switch } from "@faceless/ui/components/switch";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, Save, Sparkles, Type, Wand2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

export const LiveStyleCustomizer = () => {
  const {
    episode,
    series,
    customization,
    updateCustomization: onCustomizationChange,
  } = useEpisodeStudioContext();

  const episodeId = episode.id;
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    trpc.series.updateEpisodeCustomization.mutationOptions({
      onSuccess: () => {
        toast.success("Style customization saved to episode!");
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
      },
      onError: () => {
        toast.error("Failed to save customization");
      },
    })
  );

  const handleSave = () => {
    updateMutation.mutate({
      episodeId,
      customization,
    });
  };

  // Find music value
  const selectedMusicVal = customization.bgmUrl ?? "none";

  const handleMusicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;

    if (val === "none") {
      onCustomizationChange({ bgmUrl: null });

      return;
    }

    if (val === "custom" && isNonEmptyString(series.customMusicUrl)) {
      onCustomizationChange({ bgmUrl: series.customMusicUrl });

      return;
    }

    const preset = SERIES_MUSIC_PRESETS.find((m) => m.url === val);

    if (preset) {
      onCustomizationChange({ bgmUrl: preset.url });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle>Live Style Customizer</CardTitle>
          </div>
          <Button
            disabled={updateMutation.isPending}
            onClick={handleSave}
            variant="outline"
          >
            {updateMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Save Overrides
          </Button>
        </div>
        <CardDescription>
          Overrides are saved specifically to this episode without affecting
          series defaults.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-5">
          {/* Caption Style Presets */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Type className="size-3.5" />
                <span className="text-xs font-medium">
                  Caption Style Preset
                </span>
              </div>
              <Badge variant="secondary">
                {customization.captionStyleId.replaceAll("-", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3">
              {SERIES_CAPTION_STYLES.map((preset) => {
                const isSelected = customization.captionStyleId === preset.id;

                return (
                  <Button
                    key={preset.id}
                    onClick={() => {
                      onCustomizationChange({ captionStyleId: preset.id });
                    }}
                    variant={isSelected ? "default" : "outline"}
                  >
                    <span className="truncate">{preset.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Background Music Selector & Glitch FX in 2 Columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Background Music Track */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Music className="size-3.5" />
                <Label htmlFor="bgm-select">Background Music (BGM)</Label>
              </div>

              <NativeSelect
                aria-label="Select background music"
                className="w-full"
                id="bgm-select"
                onChange={handleMusicChange}
                value={selectedMusicVal}
              >
                <NativeSelectOption value="none">
                  None (Voice Only)
                </NativeSelectOption>
                {isNonEmptyString(series.customMusicUrl) && (
                  <NativeSelectOption value="custom">
                    Series Custom Music
                  </NativeSelectOption>
                )}
                {SERIES_MUSIC_PRESETS.map((preset) => (
                  <NativeSelectOption key={preset.id} value={preset.url}>
                    {preset.title} - {preset.description}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            {/* Glitch Effect Switch */}
            <div className="flex flex-col justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="size-3.5" />
                  <Label htmlFor="glitch-toggle">
                    Glitch Effect (CRT / RGB)
                  </Label>
                </div>
                <Switch
                  aria-label="Toggle glitch effect"
                  checked={customization.glitchEffect}
                  id="glitch-toggle"
                  onCheckedChange={(checked) => {
                    onCustomizationChange({ glitchEffect: checked });
                  }}
                />
              </div>
              <p className="text-xs">
                Applies chromatic distortion and scanline pulses at scene cuts.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
