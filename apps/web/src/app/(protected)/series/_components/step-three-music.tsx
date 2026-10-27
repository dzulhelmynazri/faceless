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
import { Spinner } from "@faceless/ui/components/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@faceless/ui/components/tabs";
import { Textarea } from "@faceless/ui/components/textarea";
import { isNonEmptyString } from "@faceless/utils";
import { Layers, Paintbrush, Pause, Play, Upload } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { useAppFiles } from "@/lib/files-client";

import { useSeriesWizard } from "../_context/series-wizard-context";

/** 10MB maximum audio upload limit */
const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024;

const MUSIC_TABS = ["presets", "custom"] as const;

const musicTabParser = parseAsStringLiteral(MUSIC_TABS).withDefault("presets");

interface CustomMusicUploadCardProps {
  hasUploaded: boolean;
  displayName: string;
  displaySize: string;
  isUploading: boolean;
  isPlaying: boolean;
  onBrowse: () => void;
  onRemove: () => void;
  onTogglePlay: () => void;
}

const CustomMusicUploadCard = ({
  hasUploaded,
  displayName,
  displaySize,
  isUploading,
  isPlaying,
  onBrowse,
  onRemove,
  onTogglePlay,
}: CustomMusicUploadCardProps) => (
  <Card>
    {hasUploaded ? (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="icon"
            disabled={isUploading}
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className="fill-current" />
            ) : (
              <Play className="fill-current" />
            )}
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {isUploading ? "Uploading to storage..." : displaySize}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isUploading && <Spinner />}
          <Button variant="ghost" disabled={isUploading} onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
    ) : (
      <Empty>
        <EmptyMedia variant="icon">
          {isUploading ? <Spinner /> : <Upload />}
        </EmptyMedia>
        <EmptyHeader>
          <EmptyDescription>
            Upload your own audio tracks (MP3, WAV, AAC, max 10MB) to use as
            background music
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" disabled={isUploading} onClick={onBrowse}>
            {isUploading ? (
              <>
                <Spinner data-icon="inline-start" />
                Uploading...
              </>
            ) : (
              "Browse files"
            )}
          </Button>
        </EmptyContent>
      </Empty>
    )}
  </Card>
);

interface StepThreeCustomMusicTabProps {
  tiktokSounds: string;
  customMusicKey: string;
  customMusicUrl: string;
  onChangeTiktokSounds: (sounds: string) => void;
  onChangeCustomMusic: (data: { key: string; url: string }) => void;
  onClearCustomMusic: () => void;
}

const StepThreeCustomMusicTab = ({
  tiktokSounds,
  customMusicKey,
  customMusicUrl,
  onChangeTiktokSounds,
  onChangeCustomMusic,
  onClearCustomMusic,
}: StepThreeCustomMusicTabProps) => {
  const files = useAppFiles();

  const [localFile, setLocalFile] = React.useState<File | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);

  const [isPlayingCustom, setIsPlayingCustom] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const customAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const localPreviewUrlRef = React.useRef<string | null>(null);

  const handleFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (file.size > MAX_AUDIO_SIZE_BYTES) {
        toast.error("File is too large. Maximum size is 10MB.");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        return;
      }

      if (localPreviewUrlRef.current !== null) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }

      const previewUrl = URL.createObjectURL(file);

      localPreviewUrlRef.current = previewUrl;

      setLocalFile(file);
      setIsUploading(true);

      const safeName = file.name.replaceAll(/[^a-zA-Z0-9.-]/gu, "_");

      const storageKey = `music/${Date.now()}-${safeName}`;

      try {
        const uploadResult = await files.upload(storageKey, file, {
          contentType: file.type === "" ? "audio/mpeg" : file.type,
        });

        let downloadUrl = "";

        try {
          downloadUrl = await files.url(uploadResult.key);
        } catch {
          downloadUrl = "";
        }

        onChangeCustomMusic({
          key: uploadResult.key,
          url: downloadUrl,
        });

        toast.success(
          `Uploaded "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
        );

        setIsUploading(false);
      } catch {
        toast.error("Failed to upload audio file. Please try again.");

        setLocalFile(null);

        if (localPreviewUrlRef.current !== null) {
          URL.revokeObjectURL(localPreviewUrlRef.current);
          localPreviewUrlRef.current = null;
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setIsUploading(false);
      }
    },
    [files, onChangeCustomMusic]
  );

  const handleRemoveUploadedFile = React.useCallback(async () => {
    if (customAudioRef.current !== null) {
      customAudioRef.current.pause();
    }

    setIsPlayingCustom(false);

    if (localPreviewUrlRef.current !== null) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }

    setLocalFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const previousKey = customMusicKey;

    onClearCustomMusic();

    if (isNonEmptyString(previousKey)) {
      try {
        await files.delete(previousKey);
      } catch {
        // Ignore remote deletion failure
      }
    }
  }, [customMusicKey, files, onClearCustomMusic]);

  const handleTogglePlayCustom = React.useCallback(() => {
    const audioSource = localPreviewUrlRef.current ?? customMusicUrl;

    if (!isNonEmptyString(audioSource)) {
      return;
    }

    if (isPlayingCustom) {
      if (customAudioRef.current !== null) {
        customAudioRef.current.pause();
      }

      setIsPlayingCustom(false);

      return;
    }

    if (customAudioRef.current !== null) {
      customAudioRef.current.pause();
    }

    const audio = new Audio(audioSource);

    customAudioRef.current = audio;

    setIsPlayingCustom(true);

    audio.addEventListener(
      "ended",
      () => {
        setIsPlayingCustom(false);
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        setIsPlayingCustom(false);
      },
      { once: true }
    );

    void audio.play().catch(() => {
      setIsPlayingCustom(false);
    });
  }, [customMusicUrl, isPlayingCustom]);

  React.useEffect(
    () => () => {
      if (customAudioRef.current !== null) {
        customAudioRef.current.pause();
      }

      if (localPreviewUrlRef.current !== null) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    },
    []
  );

  const hasUploaded = localFile !== null || isNonEmptyString(customMusicKey);

  const displayName =
    localFile?.name ??
    (isNonEmptyString(customMusicKey)
      ? (customMusicKey.split("/").pop() ?? "Custom audio track")
      : "Custom audio track");

  const displaySize =
    localFile === null
      ? "Uploaded audio"
      : `${(localFile.size / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <TabsContent value="custom" className="mt-4">
      <div className="flex flex-col gap-6">
        <Field>
          <FieldLabel htmlFor="tiktok-sounds">
            TikTok Sound URLs (copy+paste link to TikTok sound)
          </FieldLabel>
          <Textarea
            id="tiktok-sounds"
            rows={4}
            // oxlint-disable-next-line shadcn/no-restyle
            className="font-mono text-xs/relaxed"
            placeholder="Enter TikTok sound URLs, one per line"
            value={tiktokSounds}
            onChange={(event) => {
              onChangeTiktokSounds(event.target.value);
            }}
          />
        </Field>

        <Field>
          <FieldLabel>Upload custom music</FieldLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/aac,audio/mpeg,audio/*"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              void handleFileChange(event);
            }}
          />
          <CustomMusicUploadCard
            hasUploaded={hasUploaded}
            displayName={displayName}
            displaySize={displaySize}
            isUploading={isUploading}
            isPlaying={isPlayingCustom}
            onBrowse={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            onRemove={() => {
              void handleRemoveUploadedFile();
            }}
            onTogglePlay={handleTogglePlayCustom}
          />
        </Field>
      </div>
    </TabsContent>
  );
};

export const StepThreeMusic = () => {
  const {
    selectedTrackIds,
    handleToggleTrack,
    handleSelectAllTracks,
    handleClearTracks,
    tiktokSounds,
    handleChangeTiktokSounds,
    customMusicKey,
    customMusicUrl,
    handleChangeCustomMusic,
    handleClearCustomMusic,
  } = useSeriesWizard();

  const [tab, setTab] = useQueryState("musicTab", musicTabParser);

  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(
    null
  );

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleTabChange = React.useCallback(
    (value: string | null) => {
      if (value === "presets" || value === "custom") {
        if (audioRef.current !== null) {
          audioRef.current.pause();
        }

        setPlayingTrackId(null);

        void setTab(value);
      }
    },
    [setTab]
  );

  const handleTogglePlay = React.useCallback(
    (track: SeriesMusicTrack, event: React.MouseEvent) => {
      event.stopPropagation();

      if (!isNonEmptyString(track.url)) {
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

      const audio = new Audio(track.url);

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
      <PageHeader
        title="Background Music"
        description="Choose as many songs as you want, we'll pick a random one for each video"
        badge={
          <>
            <Badge variant="outline">Step 3 of 8</Badge>
            <span className="text-xs text-muted-foreground">Optional</span>
          </>
        }
      />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="presets">
            <Layers data-icon="inline-start" />
            Preset music
            {selectedTrackIds.length > 0 && (
              <Badge variant="secondary">{selectedTrackIds.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Paintbrush data-icon="inline-start" />
            Custom
          </TabsTrigger>
        </TabsList>

        {/* Preset music tab content */}
        <TabsContent value="presets" className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedTrackIds.length} of {SERIES_MUSIC_PRESETS.length}{" "}
              selected
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  handleSelectAllTracks(SERIES_MUSIC_PRESETS.map((t) => t.id));
                }}
              >
                Select all
              </Button>
              <Button
                variant="ghost"
                disabled={selectedTrackIds.length === 0}
                onClick={handleClearTracks}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {SERIES_MUSIC_PRESETS.map((track: SeriesMusicTrack) => {
              const isSelected = selectedTrackIds.includes(track.id);

              const isPlaying = playingTrackId === track.id;

              return (
                <Item
                  key={track.id}
                  variant={isSelected ? "selected" : "interactive"}
                  onClick={() => {
                    handleToggleTrack(track.id);
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

        <StepThreeCustomMusicTab
          tiktokSounds={tiktokSounds}
          customMusicKey={customMusicKey}
          customMusicUrl={customMusicUrl}
          onChangeTiktokSounds={handleChangeTiktokSounds}
          onChangeCustomMusic={handleChangeCustomMusic}
          onClearCustomMusic={handleClearCustomMusic}
        />
      </Tabs>
    </div>
  );
};
