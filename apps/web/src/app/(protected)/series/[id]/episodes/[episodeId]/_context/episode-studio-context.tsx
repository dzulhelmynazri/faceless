"use client";

import type { GetEpisodeByIdOutput } from "@faceless/contracts/series";
import { Button } from "@faceless/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import { useQuery } from "@tanstack/react-query";
import { Film } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as React from "react";

import { trpc } from "@/utils/trpc";

import { EpisodeStudioSkeleton } from "../_components/episode-studio-skeleton";
import { useEpisodeStudio } from "../_hooks/use-episode-studio";

export type EpisodeStudioContextType = ReturnType<typeof useEpisodeStudio>;

const EpisodeStudioContext =
  React.createContext<EpisodeStudioContextType | null>(null);

interface EpisodeStudioLoadedProviderProps {
  children: React.ReactNode;
  initialData: GetEpisodeByIdOutput;
  seriesId: string;
}

const EpisodeStudioLoadedProvider = ({
  children,
  initialData,
  seriesId,
}: EpisodeStudioLoadedProviderProps) => {
  const studio = useEpisodeStudio({ initialData, seriesId });

  return <EpisodeStudioContext value={studio}>{children}</EpisodeStudioContext>;
};

export interface EpisodeStudioProviderProps {
  children: React.ReactNode;
}

export const EpisodeStudioProvider = ({
  children,
}: EpisodeStudioProviderProps) => {
  const params = useParams<{ id: string; episodeId: string }>();
  const seriesId = params.id;
  const { episodeId } = params;

  const { data, isLoading, error } = useQuery(
    trpc.series.getEpisodeById.queryOptions({ episodeId })
  );

  if (isLoading) {
    return <EpisodeStudioSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Film />
            </EmptyMedia>
            <EmptyTitle>Episode Not Found</EmptyTitle>
            <EmptyDescription>
              The requested episode could not be loaded or may have been
              deleted.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button
              nativeButton={false}
              render={<Link href={`/series/${seriesId}`} />}
              variant="outline"
            >
              Return to Series
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <EpisodeStudioLoadedProvider initialData={data} seriesId={seriesId}>
      {children}
    </EpisodeStudioLoadedProvider>
  );
};

export const useEpisodeStudioContext = (): EpisodeStudioContextType => {
  const context = React.use(EpisodeStudioContext);

  if (!context) {
    throw new Error(
      "useEpisodeStudioContext must be used within an EpisodeStudioProvider"
    );
  }

  return context;
};
