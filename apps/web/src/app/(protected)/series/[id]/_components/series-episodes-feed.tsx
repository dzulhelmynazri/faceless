"use client";

import type { GetSeriesByIdOutput } from "@faceless/contracts/series";
import { Button } from "@faceless/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@faceless/ui/components/item";
import { Tabs, TabsList, TabsTrigger } from "@faceless/ui/components/tabs";
import { isNonEmptyString } from "@faceless/utils";
import { ArrowUpRight, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

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
        <h2 className="text-lg font-semibold tracking-tight">Episode Feed</h2>

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
            <Item key={ep.id} variant="outline">
              <ItemMedia className="size-12" variant="image">
                {isNonEmptyString(ep.thumbnailUrl) ? (
                  <div className="relative size-full overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      alt={`Episode #${ep.episodeNumber}`}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={ep.thumbnailUrl}
                    />
                  </div>
                ) : (
                  <div className="flex size-full items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                    #{ep.episodeNumber}
                  </div>
                )}
              </ItemMedia>

              <ItemContent>
                <ItemTitle>Episode #{ep.episodeNumber}</ItemTitle>
                <ItemDescription>{ep.title}</ItemDescription>
              </ItemContent>

              <ItemActions>
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
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
    </div>
  );
};
