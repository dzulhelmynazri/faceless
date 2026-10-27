"use client";

import type { GetSeriesByIdOutput } from "@faceless/contracts/series";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@faceless/ui/components/dialog";
import { Spinner } from "@faceless/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

type EpisodeItem = GetSeriesByIdOutput["episodes"][number];

interface SceneGalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  episode: EpisodeItem | null;
  seriesId: string;
}

export const SceneGalleryDialog = ({
  isOpen,
  onOpenChange,
  episode,
  seriesId,
}: SceneGalleryDialogProps) => {
  const queryClient = useQueryClient();

  const [regeneratingSceneNumber, setRegeneratingSceneNumber] = React.useState<
    number | null
  >(null);

  const regenerateMutation = useMutation(
    trpc.series.regenerateEpisodeScene.mutationOptions({
      onSuccess: ({ scene }) => {
        toast.success(`Scene #${scene.sceneNumber} regenerated successfully!`);
      },
      onError: () => {
        toast.error("Failed to regenerate scene. Please try again.");
      },
      onSettled: () => {
        setRegeneratingSceneNumber(null);
        void queryClient.invalidateQueries(
          trpc.series.byId.queryFilter({ id: seriesId })
        );
      },
    })
  );

  const handleRegenerateScene = (sceneNumber: number) => {
    if (
      !episode ||
      regeneratingSceneNumber !== null ||
      regenerateMutation.isPending
    ) {
      return;
    }

    setRegeneratingSceneNumber(sceneNumber);
    regenerateMutation.mutate({
      episodeId: episode.id,
      sceneNumber,
    });
  };

  if (!episode) {
    return null;
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Episode #{episode.episodeNumber}: Scene Keyframes
          </DialogTitle>
          <DialogDescription>
            {episode.title} &bull; {episode.scenes.length} visual keyframes
            calibrated to voiceover timing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 md:grid-cols-3">
          {episode.scenes.map((scene) => {
            const isRegenerating =
              regeneratingSceneNumber === scene.sceneNumber;

            return (
              <div
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs"
                key={scene.id}
              >
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    alt={`Scene ${scene.sceneNumber} Keyframe`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={scene.imageUrl}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <Badge variant="secondary">
                      Scene #{scene.sceneNumber}
                    </Badge>
                    <Badge variant="outline">{scene.duration}s</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <p className="line-clamp-2 font-medium text-foreground">
                    &ldquo;{scene.narrationText}&rdquo;
                  </p>
                  <p className="line-clamp-2 text-muted-foreground">
                    {scene.visualPrompt}
                  </p>
                </div>

                <Button
                  className="mt-auto w-full"
                  disabled={
                    regeneratingSceneNumber !== null ||
                    regenerateMutation.isPending
                  }
                  onClick={() => {
                    handleRegenerateScene(scene.sceneNumber);
                  }}
                  variant="outline"
                >
                  {isRegenerating ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw data-icon="inline-start" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
