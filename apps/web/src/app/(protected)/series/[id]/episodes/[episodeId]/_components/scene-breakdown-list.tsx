"use client";

import type { StudioSceneItem } from "@faceless/contracts/series";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@faceless/ui/components/alert";
import { AspectRatio } from "@faceless/ui/components/aspect-ratio";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card, CardContent, CardHeader } from "@faceless/ui/components/card";
import { Label } from "@faceless/ui/components/label";
import { Spinner } from "@faceless/ui/components/spinner";
import { Textarea } from "@faceless/ui/components/textarea";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  ImageIcon,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);

  return `${mins}:${Number(secs) < 10 ? "0" : ""}${secs}s`;
};

interface SceneItemCardProps {
  episodeId: string;
  scene: StudioSceneItem;
  startTime: number;
  endTime: number;
  onSeek: () => void;
  onSceneUpdated: (updated: StudioSceneItem) => void;
  onNarrationChanged: () => void;
}

const SceneItemCard = ({
  episodeId,
  scene,
  startTime,
  endTime,
  onSeek,
  onSceneUpdated,
  onNarrationChanged,
}: SceneItemCardProps) => {
  const queryClient = useQueryClient();
  const [promptText, setPromptText] = React.useState(scene.visualPrompt);
  const [narrationText, setNarrationText] = React.useState(scene.narrationText);

  const regenerateMutation = useMutation(
    trpc.series.regenerateEpisodeScene.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Scene #${scene.sceneNumber} visual regenerated!`);
        onSceneUpdated(data.scene);
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
      },
      onError: () => {
        toast.error(`Failed to regenerate Scene #${scene.sceneNumber}`);
      },
    })
  );

  const updateSceneMutation = useMutation(
    trpc.series.updateEpisodeScene.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Scene #${scene.sceneNumber} updated`);
        onSceneUpdated(data.scene);
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
      },
      onError: () => {
        toast.error(`Failed to update Scene #${scene.sceneNumber}`);
      },
    })
  );

  const handleRegenerateImage = () => {
    regenerateMutation.mutate({
      episodeId,
      sceneNumber: scene.sceneNumber,
      promptOverride:
        promptText === scene.visualPrompt ? undefined : promptText,
    });
  };

  const handleSaveNarration = () => {
    if (!narrationText.trim()) {
      toast.error("Narration text cannot be empty");

      return;
    }

    updateSceneMutation.mutate({
      episodeId,
      sceneNumber: scene.sceneNumber,
      narrationText: narrationText.trim(),
    });

    onNarrationChanged();
  };

  const handleSavePromptOnly = () => {
    if (!promptText.trim()) {
      toast.error("Visual prompt cannot be empty");

      return;
    }

    updateSceneMutation.mutate({
      episodeId,
      sceneNumber: scene.sceneNumber,
      visualPrompt: promptText.trim(),
    });
  };

  const isPromptDirty = promptText !== scene.visualPrompt;
  const isNarrationDirty = narrationText !== scene.narrationText;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Scene #{scene.sceneNumber}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>
                {formatSeconds(startTime)} - {formatSeconds(endTime)}
              </span>
              <span className="text-muted-foreground/60">
                ({scene.duration.toFixed(1)}s)
              </span>
            </div>
          </div>

          <Button onClick={onSeek} variant="ghost">
            <PlayCircle data-icon="inline-start" />
            Jump to Frame
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]">
          {/* Left: Keyframe Thumbnail */}
          <div className="flex flex-col gap-2">
            <AspectRatio
              className="group w-full max-w-[140px] overflow-hidden"
              ratio={9 / 16}
            >
              {isNonEmptyString(scene.imageUrl) ? (
                <Image
                  alt={`Scene #${scene.sceneNumber} keyframe`}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  sizes="140px"
                  src={scene.imageUrl}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  <ImageIcon className="size-6 text-muted-foreground/50" />
                </div>
              )}

              {/* Hover overlay with full-size link */}
              {isNonEmptyString(scene.imageUrl) && (
                <a
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  href={scene.imageUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="size-4 text-white" />
                </a>
              )}
            </AspectRatio>

            <Button
              disabled={regenerateMutation.isPending}
              onClick={handleRegenerateImage}
              variant="secondary"
            >
              {regenerateMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
              Regenerate Image
            </Button>
          </div>

          {/* Right: Prompt & Narration Editors */}
          <div className="flex flex-col gap-3">
            {/* Visual Prompt Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-primary" />
                  <Label htmlFor={`visual-prompt-${scene.sceneNumber}`}>
                    Visual Prompt (FLUX Schnell)
                  </Label>
                </div>
                {isPromptDirty && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      disabled={updateSceneMutation.isPending}
                      onClick={handleSavePromptOnly}
                      variant="outline"
                    >
                      Save Prompt
                    </Button>
                    <Button
                      onClick={() => {
                        setPromptText(scene.visualPrompt);
                      }}
                      variant="ghost"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              <Textarea
                aria-label={`Visual prompt for scene ${scene.sceneNumber}`}
                className="min-h-14"
                id={`visual-prompt-${scene.sceneNumber}`}
                onChange={(e) => {
                  setPromptText(e.target.value);
                }}
                value={promptText}
              />
            </div>

            {/* Dialogue Narration Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="size-3 text-muted-foreground" />
                  <Label htmlFor={`narration-text-${scene.sceneNumber}`}>
                    Spoken Narration (ElevenLabs TTS)
                  </Label>
                </div>
                {isNarrationDirty && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      disabled={updateSceneMutation.isPending}
                      onClick={handleSaveNarration}
                      variant="default"
                    >
                      {updateSceneMutation.isPending ? (
                        <>
                          <Spinner data-icon="inline-start" />
                          Saving...
                        </>
                      ) : (
                        "Save Dialogue"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setNarrationText(scene.narrationText);
                      }}
                      variant="ghost"
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </div>

              <Textarea
                aria-label={`Spoken narration for scene ${scene.sceneNumber}`}
                className="min-h-14"
                id={`narration-text-${scene.sceneNumber}`}
                onChange={(e) => {
                  setNarrationText(e.target.value);
                }}
                value={narrationText}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SceneBreakdownList = () => {
  const {
    episode,
    scenes,
    isAudioStale,
    seekToScene,
    updateSceneLocally,
    setIsAudioStale,
    onAudioRegenerated,
  } = useEpisodeStudioContext();

  const episodeId = episode.id;
  const queryClient = useQueryClient();

  const generateAudioMutation = useMutation(
    trpc.series.generateEpisodeAudio.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          "Voiceover re-synthesized and word timings synchronized!"
        );
        onAudioRegenerated(data.audioUrl, data.metadata);
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
      },
      onError: () => {
        toast.error("Failed to re-synthesize voiceover");
      },
    })
  );

  const handleResynthesizeAudio = () => {
    generateAudioMutation.mutate({ episodeId });
  };

  // Compute scene time ranges sequentially
  const sceneIntervals = React.useMemo(() => {
    const intervals: { start: number; end: number }[] = [];
    let start = 0;

    for (const sc of scenes) {
      intervals.push({ start, end: start + sc.duration });
      start += sc.duration;
    }

    return intervals;
  }, [scenes]);

  return (
    <div className="flex flex-col gap-4">
      {/* Dialogue Stale Alert Banner */}
      {isAudioStale && (
        <Alert variant="destructive">
          <AlertTriangle />
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <AlertTitle>Dialogue Modified (Voiceover Stale)</AlertTitle>
              <AlertDescription>
                You modified narration text. Re-synthesize voiceover to sync
                audio waveforms and word timings with ElevenLabs.
              </AlertDescription>
            </div>
            <Button
              disabled={generateAudioMutation.isPending}
              onClick={handleResynthesizeAudio}
              size="sm"
              variant="default"
            >
              {generateAudioMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Volume2 data-icon="inline-start" />
              )}
              Re-synthesize Voiceover
            </Button>
          </div>
        </Alert>
      )}

      {/* Breakdown Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Scene Breakdown ({scenes.length} Scenes)
          </h2>
          <p className="text-xs text-muted-foreground">
            Fine-tune prompts, regenerate visual keyframes individually, or edit
            spoken narration.
          </p>
        </div>
      </div>

      {/* Scene Cards Stack */}
      <div className="flex flex-col gap-3">
        {scenes.map((scene, idx) => {
          const interval = sceneIntervals[idx] ?? {
            start: 0,
            end: scene.duration,
          };

          return (
            <SceneItemCard
              endTime={interval.end}
              episodeId={episodeId}
              key={`${scene.id}-${scene.visualPrompt}-${scene.narrationText}`}
              onNarrationChanged={() => {
                setIsAudioStale(true);
              }}
              onSceneUpdated={(updated) => {
                updateSceneLocally(scene.sceneNumber, updated);
              }}
              onSeek={() => {
                seekToScene(scene.sceneNumber);
              }}
              scene={scene}
              startTime={interval.start}
            />
          );
        })}
      </div>
    </div>
  );
};
