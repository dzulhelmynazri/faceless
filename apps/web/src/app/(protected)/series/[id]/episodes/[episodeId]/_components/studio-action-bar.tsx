"use client";

import { Button } from "@faceless/ui/components/button";
import { Spinner } from "@faceless/ui/components/spinner";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Download,
  Film,
  Globe,
  Send,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

export const StudioActionBar = () => {
  const { episode, seriesId } = useEpisodeStudioContext();

  const { id: episodeId, episodeNumber, status, videoUrl, error } = episode;

  const queryClient = useQueryClient();

  const episodeQueryFilter = trpc.series.getEpisodeById.queryFilter({
    episodeId,
  });

  const invalidateQueries = () => {
    void queryClient.invalidateQueries(episodeQueryFilter);
    void queryClient.invalidateQueries(
      trpc.series.byId.queryFilter({ id: seriesId })
    );
  };

  const updateStatusMutation = useMutation(
    trpc.series.updateEpisodeStatus.mutationOptions({
      onError: () => {
        toast.error("Failed to update episode status");
      },
      onSuccess: () => {
        invalidateQueries();
      },
    })
  );

  const renderEpisodeMutation = useMutation(
    trpc.series.renderEpisode.mutationOptions({
      onError: () => {
        toast.error("Failed to initiate video render");
      },
      onSuccess: () => {
        invalidateQueries();
      },
    })
  );

  const publishNowMutation = useMutation(
    trpc.series.publishEpisodeNow.mutationOptions({
      onError: () => {
        toast.error("Failed to publish episode to socials");
      },
      onSuccess: () => {
        invalidateQueries();
      },
    })
  );

  const isPending =
    updateStatusMutation.isPending ||
    renderEpisodeMutation.isPending ||
    publishNowMutation.isPending;

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      {/* Left: Back Link */}
      <div className="flex items-center gap-3">
        <Button
          nativeButton={false}
          render={<Link href={`/series/${seriesId}`} />}
          variant="ghost"
        >
          <ArrowLeft data-icon="inline-start" />
          <span className="hidden sm:inline">Back to Series</span>
        </Button>
        {isNonEmptyString(error) && status === "FAILED" && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {status === "RENDERING" && (
          <Button disabled variant="outline">
            <Spinner data-icon="inline-start" />
            Rendering Video (1080x1920)...
          </Button>
        )}

        {status === "PUBLISHING" && (
          <Button disabled variant="outline">
            <Spinner data-icon="inline-start" />
            Publishing to Socials...
          </Button>
        )}

        {status === "APPROVED" && (
          <Button disabled variant="secondary">
            <CheckCircle2 data-icon="inline-start" />
            Approved & Scheduled
          </Button>
        )}

        {status === "PUBLISHED" && (
          <Button disabled variant="default">
            <Globe data-icon="inline-start" />
            Published Live
          </Button>
        )}

        {/* Download MP4 button when video is available on R2 */}
        {isNonEmptyString(videoUrl) && (
          <Button
            nativeButton={false}
            render={
              <a
                aria-label="Download MP4 video"
                href={videoUrl}
                download={`episode_${episodeNumber}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="outline"
          >
            <Download data-icon="inline-start" />
            Download MP4
          </Button>
        )}

        {/* READY_FOR_REVIEW: Approve & Render */}
        {status === "READY_FOR_REVIEW" && (
          <>
            <Button
              disabled={isPending}
              onClick={() => {
                renderEpisodeMutation.mutate({ episodeId });
              }}
              variant="outline"
            >
              {renderEpisodeMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Film data-icon="inline-start" />
              )}
              Render Video
            </Button>
            <Button
              disabled={isPending}
              onClick={() => {
                updateStatusMutation.mutate({
                  episodeId,
                  status: "APPROVED",
                });
              }}
              variant="default"
            >
              {updateStatusMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CalendarCheck data-icon="inline-start" />
              )}
              Approve & Schedule
            </Button>
          </>
        )}

        {/* APPROVED: Direct Publish Now */}
        {status === "APPROVED" && (
          <Button
            disabled={isPending}
            onClick={() => {
              publishNowMutation.mutate({ episodeId });
            }}
            variant="default"
          >
            {publishNowMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Publish Now
          </Button>
        )}
      </div>
    </div>
  );
};
