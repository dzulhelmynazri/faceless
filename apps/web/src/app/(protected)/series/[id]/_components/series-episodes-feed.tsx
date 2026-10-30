"use client";

import type { GetSeriesByIdOutput } from "@faceless/contracts/series";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card, CardContent } from "@faceless/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import { Tabs, TabsList, TabsTrigger } from "@faceless/ui/components/tabs";
import { isNonEmptyString } from "@faceless/utils";
import { ArrowUpRight, Images, Video, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { SceneGalleryDialog } from "./scene-gallery-dialog";

type EpisodeTab = "ALL" | "READY" | "SCHEDULED" | "PUBLISHED";

type EpisodeItem = GetSeriesByIdOutput["episodes"][number];

interface SeriesEpisodesFeedProps {
  seriesId: string;
  episodes: EpisodeItem[];
}

const isEpisodeTab = (val: string): val is EpisodeTab =>
  val === "ALL" ||
  val === "READY" ||
  val === "SCHEDULED" ||
  val === "PUBLISHED";

export const SeriesEpisodesFeed = ({
  seriesId,
  episodes,
}: SeriesEpisodesFeedProps) => {
  const [activeTab, setActiveTab] = React.useState<EpisodeTab>("ALL");

  const [galleryEpisode, setGalleryEpisode] =
    React.useState<EpisodeItem | null>(null);

  const filteredEpisodes = React.useMemo(() => {
    if (activeTab === "READY") {
      return episodes.filter((ep) => ep.status === "READY_FOR_REVIEW");
    }

    if (activeTab === "SCHEDULED") {
      return episodes.filter((ep) => ep.status === "APPROVED");
    }

    if (activeTab === "PUBLISHED") {
      return episodes.filter((ep) => ep.status === "PUBLISHED");
    }

    return episodes;
  }, [episodes, activeTab]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Episode Feed</h2>
          <p className="text-xs text-muted-foreground">
            Review scripts, preview videos, and track publishing.
          </p>
        </div>

        <Tabs
          onValueChange={(val: string) => {
            if (isEpisodeTab(val)) {
              setActiveTab(val);
            }
          }}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="ALL">All ({episodes.length})</TabsTrigger>
            <TabsTrigger value="READY">Review</TabsTrigger>
            <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
            <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredEpisodes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Video className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No Episodes in this View</EmptyTitle>
            <EmptyDescription>
              Episodes will be generated automatically based on your schedule,
              or you can create one right now on demand.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredEpisodes.map((ep) => (
            <Card key={ep.id}>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {isNonEmptyString(ep.thumbnailUrl) ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          alt={ep.title}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={ep.thumbnailUrl}
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                        #{ep.episodeNumber}
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {ep.title}
                        </span>
                        <Badge>{ep.status}</Badge>
                        {isNonEmptyString(ep.audioUrl) && (
                          <Badge variant="outline">
                            <Volume2 data-icon="inline-start" />
                            Audio
                          </Badge>
                        )}
                        {ep.scenes.length > 0 && (
                          <Badge variant="outline">
                            <Images data-icon="inline-start" />
                            {ep.scenes.length} Scenes
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {isNonEmptyString(ep.topic)
                          ? `Topic: ${ep.topic}`
                          : "Autonomous ideation"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ep.scenes.length > 0 && (
                      <Button
                        onClick={() => {
                          setGalleryEpisode(ep);
                        }}
                        variant="outline"
                      >
                        <Images data-icon="inline-start" />
                        Preview Scenes
                      </Button>
                    )}
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/series/${seriesId}/episodes/${ep.id}`} />
                      }
                      variant="outline"
                    >
                      Open in Studio
                      <ArrowUpRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SceneGalleryDialog
        episode={galleryEpisode}
        isOpen={galleryEpisode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setGalleryEpisode(null);
          }
        }}
        seriesId={seriesId}
      />
    </div>
  );
};
