"use client";

import type { SocialPlatform } from "@faceless/contracts";
import { Button } from "@faceless/ui/components/button";
import { Spinner } from "@faceless/ui/components/spinner";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Download,
  Film,
  Send,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

interface SocialPlatformConfig {
  getUrl: (postId: string) => string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  label: string;
}

const SOCIAL_PLATFORMS = {
  INSTAGRAM: {
    getUrl: (id: string) => `https://www.instagram.com/reel/${id}`,
    icon: Instagram,
    label: "Instagram",
  },
  TIKTOK: {
    getUrl: (id: string) => `https://www.tiktok.com/@/video/${id}`,
    icon: Tiktok,
    label: "TikTok",
  },
  YOUTUBE: {
    getUrl: (id: string) => `https://youtube.com/shorts/${id}`,
    icon: Youtube,
    label: "YouTube",
  },
} as const satisfies Record<SocialPlatform, SocialPlatformConfig>;

export const StudioActionBar = () => {
  const { episode, seriesId, publications } = useEpisodeStudioContext();

  const { id: episodeId, episodeNumber, status, videoUrl, error } = episode;

  const livePublications = React.useMemo(
    () =>
      publications
        .map((pub) => {
          if (!isNonEmptyString(pub.externalPostId)) {
            return null;
          }

          const platform = SOCIAL_PLATFORMS[pub.platform];

          return {
            ...pub,
            icon: platform.icon,
            label: platform.label,
            url: platform.getUrl(pub.externalPostId),
          };
        })
        .filter((item) => item !== null),
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
            <div className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1.25">
              <span className="size-1.5 rounded-full bg-success" />
              <span className="text-xs font-medium">Published Live</span>
            </div>

            {livePublications.map((pub) => {
              const Icon = pub.icon;

              return (
                <Button
                  key={pub.id}
                  nativeButton={false}
                  render={
                    <a
                      aria-label={`View live post on ${pub.label}`}
                      href={pub.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      title={`View live post on ${pub.label}`}
                    />
                  }
                  size="icon"
                  variant="outline"
                >
                  <Icon className="size-3.5" />
                </Button>
              );
            })}
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
