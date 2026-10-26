"use client";

import type { GetSeriesByIdOutput } from "@faceless/contracts/series";
import { Badge } from "@faceless/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { isNonEmptyString } from "@faceless/utils";
import { Clock, Layers, Mic, Palette } from "lucide-react";
import * as React from "react";

interface SeriesDetailHeaderProps {
  series: GetSeriesByIdOutput;
}

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
  switch (platform) {
    case "TIKTOK": {
      return <Tiktok className="size-3.5" />;
    }

    case "YOUTUBE": {
      return <Youtube className="size-3.5 text-destructive" />;
    }

    case "INSTAGRAM": {
      return <Instagram className="size-3.5" />;
    }

    default: {
      return null;
    }
  }
};

export const SeriesDetailHeader = ({ series }: SeriesDetailHeaderProps) => (
  <Card>
    <CardHeader>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <CardTitle>{series.name}</CardTitle>
          <Badge variant={getSeriesStatusVariant(series.status)}>
            {series.status}
          </Badge>
          {isNonEmptyString(series.nichePresetId) && (
            <Badge variant="outline">{series.nichePresetId}</Badge>
          )}
        </div>
      </div>
      <CardDescription>{series.nichePrompt}</CardDescription>
    </CardHeader>

    <CardContent>
      <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-4 text-xs sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            Publish Schedule
          </span>
          <span className="font-semibold">{series.publishTime}</span>
          <span className="text-muted-foreground">Auto-generates 2h prior</span>
        </div>

        <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Mic className="size-3.5 text-primary" />
            Voice & Language
          </span>
          <span className="truncate font-semibold">
            {series.voiceId} ({series.language.toUpperCase()})
          </span>
          <span className="text-muted-foreground">
            Duration: {series.videoDuration}s
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Palette className="size-3.5 text-primary" />
            Style & Captions
          </span>
          <span className="truncate font-semibold">{series.artStyleId}</span>
          <span className="text-muted-foreground">
            Captions: {series.captionStyleId}
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Layers className="size-3.5 text-primary" />
            Connected Channels
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            {series.socialAccounts.length > 0 ? (
              series.socialAccounts.map((acc) => (
                <div
                  className="flex size-5 items-center justify-center rounded-full bg-background"
                  key={acc.id}
                  title={`${acc.platform}: ${acc.platformUserName}`}
                >
                  <SocialIcon platform={acc.platform} />
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">None connected</span>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
