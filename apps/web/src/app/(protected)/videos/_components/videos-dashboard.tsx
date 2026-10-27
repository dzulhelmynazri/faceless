"use client";

import type { GetSeriesListOutput } from "@faceless/contracts/series";
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
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@faceless/ui/components/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import { Skeleton } from "@faceless/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@faceless/ui/components/tabs";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowRight,
  Clock,
  Layers,
  Mic,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { trpc } from "@/utils/trpc";

type SeriesItem = GetSeriesListOutput[number];

type FilterTab = "ALL" | "ACTIVE" | "PAUSED" | "ARCHIVED";

const isFilterTab = (val: string): val is FilterTab =>
  val === "ALL" || val === "ACTIVE" || val === "PAUSED" || val === "ARCHIVED";

const getSeriesStatusVariant = (status: "ACTIVE" | "PAUSED" | "ARCHIVED") => {
  if (status === "ACTIVE") {
    return "default";
  }

  if (status === "PAUSED") {
    return "secondary";
  }

  return "outline";
};

const SocialIcon = ({
  platform,
}: {
  platform: "TIKTOK" | "YOUTUBE" | "INSTAGRAM";
}) => {
  if (platform === "TIKTOK") {
    return <Tiktok className="size-3.5" />;
  }

  if (platform === "YOUTUBE") {
    return <Youtube className="size-3.5" />;
  }

  if (platform === "INSTAGRAM") {
    return <Instagram className="size-3.5" />;
  }

  return null;
};

const SeriesCard = ({ series }: { series: SeriesItem }) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const updateStatusMutation = useMutation(
    trpc.series.updateStatus.mutationOptions({
      onSuccess: ({ status }) => {
        toast.success(`Series status updated to ${status}`);
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
      },
      onError: () => {
        toast.error("Failed to update series status");
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.series.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Series deleted");
        queryClient.removeQueries(
          trpc.series.byId.queryFilter({ id: series.id })
        );
        void queryClient.invalidateQueries(trpc.series.list.queryFilter());
      },
      onError: () => {
        toast.error("Failed to delete series");
      },
    })
  );

  const handleTogglePause = () => {
    const nextStatus = series.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    updateStatusMutation.mutate({ id: series.id, status: nextStatus });
  };

  const handleToggleArchive = () => {
    const nextStatus = series.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED";
    updateStatusMutation.mutate({ id: series.id, status: nextStatus });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: series.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle>
                <Link
                  className="hover:text-primary hover:underline"
                  href={`/series/${series.id}`}
                >
                  {series.name}
                </Link>
              </CardTitle>
              <Badge variant={getSeriesStatusVariant(series.status)}>
                {series.status}
              </Badge>
            </div>
            <CardDescription>
              {isNonEmptyString(series.nichePresetId)
                ? `Niche: ${series.nichePresetId}`
                : "Custom Series"}
            </CardDescription>
          </div>

          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon" variant="ghost" />}
              >
                <MoreVertical />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePause}>
                  {series.status === "ACTIVE" ? (
                    <>
                      <Pause className="size-4" />
                      Pause Series
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Resume Series
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleArchive}>
                  <Archive className="size-4" />
                  {series.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setShowDeleteDialog(true);
                  }}
                >
                  <span className="flex items-center text-destructive">
                    <Trash2 className="size-4" />
                    Delete Series
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>
                {isNonEmptyString(series.publishTime)
                  ? `Posts at ${series.publishTime}`
                  : "Manual schedule"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Mic className="size-4 shrink-0" />
              <span>
                {series.voiceId}
                {isNonEmptyString(series.language) && ` (${series.language})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="size-4 shrink-0" />
              <span>
                {isNonEmptyString(series.artStyleId)
                  ? `Style: ${series.artStyleId}`
                  : "Standard art style"}
              </span>
            </div>

            {series.platforms && series.platforms.length > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <Video className="size-4 shrink-0" />
                <div className="flex items-center gap-1.5">
                  {series.platforms.map((platform) => (
                    <SocialIcon key={platform} platform={platform} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {series.episodeCount} episodes
          </span>
          <Button
            nativeButton={false}
            render={<Link href={`/series/${series.id}`} />}
            size="sm"
            variant="ghost"
          >
            Manage
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{series.name}&quot;? This
              action cannot be undone and will delete all associated episodes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const SeriesEmptyState = ({ filter }: { filter: FilterTab }) => {
  if (filter === "PAUSED") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Pause />
          </EmptyMedia>
          <EmptyTitle>No Paused Series</EmptyTitle>
          <EmptyDescription>
            You have no series currently paused. Active pipelines generate
            episodes on their designated schedules.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (filter === "ARCHIVED") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Archive />
          </EmptyMedia>
          <EmptyTitle>No Archived Series</EmptyTitle>
          <EmptyDescription>
            Archived series will show up here when you choose to retire an
            automated pipeline.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Video />
        </EmptyMedia>
        <EmptyTitle>
          {filter === "ACTIVE" ? "No Active Series" : "No Series Created Yet"}
        </EmptyTitle>
        <EmptyDescription>
          Create your first automated faceless video series in minutes with AI
          voiceover, dynamic visual scenes, and multi-platform publishing.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/series" />}>
          Create Series
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export const VideosDashboard = () => {
  const [filter, setFilter] = React.useState<FilterTab>("ACTIVE");

  const { data: seriesList = [], isLoading } = useQuery(
    trpc.series.list.queryOptions()
  );

  const filteredSeries = React.useMemo(() => {
    if (filter === "ALL") {
      return seriesList;
    }

    return seriesList.filter((item) => item.status === filter);
  }, [seriesList, filter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Videos"
        description="View and manage your automated video series and content pipelines."
      />

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          onValueChange={(val: string) => {
            if (isFilterTab(val)) {
              setFilter(val);
            }
          }}
          value={filter}
        >
          <TabsList>
            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
            <TabsTrigger value="PAUSED">Paused</TabsTrigger>
            <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
            <TabsTrigger value="ALL">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredSeries.length === 0 && (
        <SeriesEmptyState filter={filter} />
      )}

      {!isLoading && filteredSeries.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredSeries.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </div>
  );
};
