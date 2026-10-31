"use client";

import type { SocialPlatform } from "@faceless/contracts";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Spinner } from "@faceless/ui/components/spinner";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  Film,
  Send,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const getSocialPostUrl = (
  platform: SocialPlatform,
  postId: string | null
): string | null => {
  if (!isNonEmptyString(postId)) {
    return null;
  }

  switch (platform) {
    case "YOUTUBE": {
      return `https://youtube.com/shorts/${postId}`;
    }

    case "TIKTOK": {
      return `https://www.tiktok.com/@/video/${postId}`;
    }

    case "INSTAGRAM": {
      return `https://www.instagram.com/reel/${postId}`;
    }

    default: {
      return null;
    }
  }
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

export const StudioActionBar = () => {
  const { episode, seriesId, publications } = useEpisodeStudioContext();

  const { id: episodeId, episodeNumber, status, videoUrl, error } = episode;

  const livePublications = React.useMemo(
    () =>
      publications
        .map((pub) => {
          const url = getSocialPostUrl(pub.platform, pub.externalPostId);

          return isNonEmptyString(url)
            ? { ...pub, label: PLATFORM_LABELS[pub.platform], url }
            : null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [publications]
  );

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
          <>
            <Badge variant="outline">
              <span className="size-1.5 rounded-full bg-success" />
              Published Live
            </Badge>

            {livePublications.map((pub) => (
              <Button
                key={pub.id}
                nativeButton={false}
                render={
                  <a
                    aria-label={`View live post on ${pub.label}`}
                    href={pub.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  />
                }
                variant="outline"
              >
                View on {pub.label}
                <ExternalLink data-icon="inline-end" />
              </Button>
            ))}
          </>
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

        {/* APPROVED or FAILED (with videoUrl): Direct Publish Now / Retry */}
        {(status === "APPROVED" ||
          (status === "FAILED" && isNonEmptyString(videoUrl))) && (
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
            {status === "FAILED" ? "Retry Publishing" : "Publish Now"}
          </Button>
        )}
      </div>
    </div>
  );
};
