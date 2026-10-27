"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@faceless/ui/components/alert-dialog";
import { Button, buttonVariants } from "@faceless/ui/components/button";
import { Card, CardHeader } from "@faceless/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import { Skeleton } from "@faceless/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

import { SeriesDetailHeader } from "./_components/series-detail-header";
import { SeriesEpisodesFeed } from "./_components/series-episodes-feed";
import { SeriesSettingsDialog } from "./_components/series-settings-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SeriesDetailPage = ({ params }: PageProps) => {
  const { id } = React.use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const { data: series, isLoading } = useQuery(
    trpc.series.byId.queryOptions({ id })
  );

  const updateStatusMutation = useMutation(
    trpc.series.updateStatus.mutationOptions({
      onSuccess: ({ status }) => {
        toast.success(`Series status updated to ${status}`);
        void queryClient.invalidateQueries(
          trpc.series.byId.queryFilter({ id })
        );
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
      },
      onError: () => {
        toast.error("Failed to update status");
      },
    })
  );

  const updateSeriesMutation = useMutation(
    trpc.series.update.mutationOptions({
      onSuccess: () => {
        toast.success("Series settings updated");
        setIsSettingsOpen(false);
        void queryClient.invalidateQueries(
          trpc.series.byId.queryFilter({ id })
        );
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
      },
      onError: () => {
        toast.error("Failed to update settings");
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.series.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Series deleted");
        queryClient.removeQueries(trpc.series.byId.queryFilter({ id }));
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
        router.push("/videos");
      },
      onError: () => {
        toast.error("Failed to delete series");
      },
    })
  );

  const generateEpisodeMutation = useMutation(
    trpc.series.generateEpisode.mutationOptions({
      onSuccess: () => {
        toast.success("Episode generated with voiceover audio!");
        void queryClient.invalidateQueries(
          trpc.series.byId.queryFilter({ id })
        );
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
      },
      onError: () => {
        toast.error(
          "Failed to generate episode. Check your ElevenLabs configuration."
        );
      },
    })
  );

  const handleGenerateEpisode = () => {
    if (!series || generateEpisodeMutation.isPending) {
      return;
    }

    toast.info("Synthesizing script and ElevenLabs voiceover...");
    generateEpisodeMutation.mutate({ seriesId: series.id });
  };

  const handleToggleStatus = () => {
    if (!series) {
      return;
    }

    const nextStatus = series.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    updateStatusMutation.mutate({ id: series.id, status: nextStatus });
  };

  const handleToggleArchive = () => {
    if (!series) {
      return;
    }

    const nextStatus = series.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    updateStatusMutation.mutate({ id: series.id, status: nextStatus });
  };

  const handleSaveSettings = (data: { name: string; publishTime: string }) => {
    if (!series) {
      return;
    }

    updateSeriesMutation.mutate({
      id: series.id,
      name: data.name,
      publishTime: data.publishTime,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!series) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Series Not Found</EmptyTitle>
          <EmptyDescription>
            The series you are looking for does not exist or has been deleted.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link className={buttonVariants()} href="/videos">
            Return to Dashboard
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between">
        <Link className={buttonVariants({ variant: "ghost" })} href="/videos">
          <ArrowLeft />
          Back to Videos
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsSettingsOpen(true);
            }}

            variant="outline"
          >
            <Settings data-icon="inline-start" />
            Settings
          </Button>
          <Button onClick={handleToggleStatus} variant="outline">
            {series.status === "ACTIVE" ? (
              <>
                <Pause data-icon="inline-start" />
                Pause Series
              </>
            ) : (
              <>
                <Play data-icon="inline-start" />
                Resume Series
              </>
            )}
          </Button>
          <Button
            disabled={generateEpisodeMutation.isPending}
            onClick={handleGenerateEpisode}
          >
            <Sparkles data-icon="inline-start" />
            {generateEpisodeMutation.isPending
              ? "Generating Voiceover..."
              : "Generate Episode Now"}
          </Button>
        </div>
      </div>

      {/* Series Header Card */}
      <SeriesDetailHeader series={series} />

      {/* Episodes Section */}
      <SeriesEpisodesFeed
        episodes={series.episodes}
        isGenerating={generateEpisodeMutation.isPending}
        onGenerateEpisode={handleGenerateEpisode}
        seriesId={series.id}
      />

      {/* Settings Dialog */}
      <SeriesSettingsDialog
        initialName={series.name}
        initialPublishTime={series.publishTime}
        isOpen={isSettingsOpen}
        isSaving={updateSeriesMutation.isPending}
        onOpenChange={setIsSettingsOpen}
        onOpenDeleteDialog={() => {
          setShowDeleteDialog(true);
        }}
        onSave={handleSaveSettings}
        onToggleArchive={handleToggleArchive}
        status={series.status}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{series.name}&rdquo; and all
              associated episodes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteMutation.mutate({ id: series.id });
              }}
              variant="destructive"
            >
              Delete Series
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeriesDetailPage;
