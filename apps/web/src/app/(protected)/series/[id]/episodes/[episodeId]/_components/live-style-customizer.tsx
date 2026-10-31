"use client";

import {
  SERIES_CAPTION_STYLES,
  SERIES_MUSIC_PRESETS,
} from "@faceless/contracts/series";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@faceless/ui/components/item";
import { Label } from "@faceless/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@faceless/ui/components/select";
import { Spinner } from "@faceless/ui/components/spinner";
import { Switch } from "@faceless/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@faceless/ui/components/tooltip";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
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

  const selectedMusicPreset = React.useMemo(() => {
    if (
      !isNonEmptyString(customization.bgmUrl) ||
      customization.bgmUrl === "none"
    ) {
      return null;
    }

    if (
      isNonEmptyString(series.customMusicUrl) &&
      customization.bgmUrl === series.customMusicUrl
    ) {
      return { title: "Series Custom Music", description: "Uploaded audio" };
    }

    return (
      SERIES_MUSIC_PRESETS.find((m) => m.url === customization.bgmUrl) ?? null
    );
  }, [customization.bgmUrl, series.customMusicUrl]);

  const handleMusicChange = (val: string | null) => {
    if (!isNonEmptyString(val) || val === "none") {
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
        <CardTitle>Live Style Customizer</CardTitle>
        <CardDescription>
          Episode overrides won&apos;t affect series defaults.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-5">
          {/* Caption Style Presets */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium">Caption Style Preset</span>

            <div className="grid grid-cols-2 gap-1.5">
              {SERIES_CAPTION_STYLES.map((preset) => {
                const isSelected = customization.captionStyleId === preset.id;

                return (
                  <Button
                    key={preset.id}
                    onClick={() => {
                      onCustomizationChange({ captionStyleId: preset.id });
                    }}
                    variant={isSelected ? "secondary" : "outline"}
                  >
                    <span className="truncate">{preset.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Background Music Selector & Glitch FX */}
          <div className="flex flex-col gap-4">
            {/* Background Music Track */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="bgm-select">Background Music (BGM)</Label>

              <Select
                onValueChange={handleMusicChange}
                value={selectedMusicVal}
              >
                <SelectTrigger
                  aria-label="Select background music"
                  className="w-full"
                  id="bgm-select"
                >
                  <SelectValue>
                    {selectedMusicPreset
                      ? `${selectedMusicPreset.title} - ${selectedMusicPreset.description}`
                      : "None (Voice Only)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">None (Voice Only)</SelectItem>
                    {isNonEmptyString(series.customMusicUrl) && (
                      <SelectItem value="custom">
                        Series Custom Music
                      </SelectItem>
                    )}
                    {SERIES_MUSIC_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.url}>
                        {preset.title} - {preset.description}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Glitch Effect Switch */}
            <Item variant="outline" size="xs">
              <ItemContent>
                <ItemTitle>
                  <Label className="cursor-pointer" htmlFor="glitch-toggle">
                    Glitch Effect (CRT / RGB)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <Info />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      Adds chromatic distortion and scanline pulses at scene
                      cuts.
                    </TooltipContent>
                  </Tooltip>
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <Switch
                  aria-label="Toggle glitch effect"
                  checked={customization.glitchEffect}
                  id="glitch-toggle"
                  onCheckedChange={(checked) => {
                    onCustomizationChange({ glitchEffect: checked });
                  }}
                />
              </ItemActions>
            </Item>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={updateMutation.isPending}
          onClick={handleSave}
        >
          {updateMutation.isPending && <Spinner data-icon="inline-start" />}
          Save Overrides
        </Button>
      </CardFooter>
    </Card>
  );
};
