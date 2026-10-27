"use client";

import type { GetEpisodeByIdOutput } from "@faceless/contracts/series";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Separator } from "@faceless/ui/components/separator";
import { Spinner } from "@faceless/ui/components/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Globe,
  Send,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { useEpisodeStudioContext } from "../_context/episode-studio-context";

const getStatusBadgeVariant = (
  status: GetEpisodeByIdOutput["episode"]["status"]
) => {
  if (status === "PUBLISHED") {
    return "default";
  }

  if (status === "APPROVED") {
    return "secondary";
  }

  if (status === "FAILED") {
    return "destructive";
  }

  return "outline";
};

export const StudioActionBar = () => {
  const { episode, seriesId, onStatusUpdated } = useEpisodeStudioContext();
  const { id: episodeId, title: episodeTitle, episodeNumber, status } = episode;
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation(
    trpc.series.updateEpisodeStatus.mutationOptions({
      onSuccess: (data) => {
        onStatusUpdated(data.status);
        void queryClient.invalidateQueries(
          trpc.series.getEpisodeById.queryFilter({ episodeId })
        );
        void queryClient.invalidateQueries(
          trpc.series.byId.queryFilter({ id: seriesId })
        );
        toast.success(
          data.status === "APPROVED"
            ? "Episode approved! Scheduled for automatic publishing."
            : `Episode status updated to ${data.status}`
        );
      },
      onError: () => {
        toast.error("Failed to update episode status");
      },
    })
  );

  const handleApprove = () => {
    updateStatusMutation.mutate({
      episodeId,
      status: "APPROVED",
    });
  };

  const handlePublishNow = () => {
    updateStatusMutation.mutate({
      episodeId,
      status: "PUBLISHED",
    });
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col justify-between gap-3 border-b border-border/80 bg-background/80 py-3 backdrop-blur-xl sm:flex-row sm:items-center">
      {/* Left: Back Link & Episode Title */}
      <div className="flex items-center gap-3">
        <Button
          nativeButton={false}
          render={<Link href={`/series/${seriesId}`} />}
          variant="ghost"
        >
          <ArrowLeft data-icon="inline-start" />
          <span className="hidden sm:inline">Back to Series</span>
        </Button>

        <Separator orientation="vertical" className="h-4" />

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">
              Episode #{episodeNumber}: {episodeTitle}
            </h1>
            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
          </div>
        </div>
      </div>

      {/* Right: Approval & Publishing Actions */}
      <div className="flex items-center gap-2">
        {status === "APPROVED" && (
          <Badge variant="secondary">
            <CheckCircle2 data-icon="inline-start" />
            Approved for Release
          </Badge>
        )}

        {status === "PUBLISHED" && (
          <Badge variant="default">
            <Globe data-icon="inline-start" />
            Published Live
          </Badge>
        )}

        {status !== "APPROVED" && status !== "PUBLISHED" && (
          <Button
            disabled={updateStatusMutation.isPending}
            onClick={handleApprove}
            size="sm"
            variant="default"
          >
            {updateStatusMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CalendarCheck data-icon="inline-start" />
            )}
            Approve & Schedule
          </Button>
        )}

        {status !== "PUBLISHED" && (
          <Button
            disabled={updateStatusMutation.isPending}
            onClick={handlePublishNow}
            size="sm"
            variant="outline"
          >
            {updateStatusMutation.isPending ? (
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
