"use client";

import type {
  SocialConnectionItem,
  SocialPlatform,
} from "@faceless/contracts/social";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card, CardContent } from "@faceless/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@faceless/ui/components/dialog";
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
  ItemMedia,
  ItemTitle,
} from "@faceless/ui/components/item";
import { Skeleton } from "@faceless/ui/components/skeleton";
import { Spinner } from "@faceless/ui/components/spinner";
import { Switch } from "@faceless/ui/components/switch";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Share2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { trpc } from "@/utils/trpc";

import { useSeriesWizard } from "../_context/series-wizard-context";

interface SupportedPlatformOption {
  id: SocialPlatform;
  name: string;
  notice: string;
  icon: React.ComponentType<{ className: string }>;
}

const SUPPORTED_PLATFORMS: readonly SupportedPlatformOption[] = [
  {
    id: "TIKTOK",
    name: "TikTok",
    notice: "Your TikTok account must be active to connect.",
    icon: Tiktok,
  },
  {
    id: "INSTAGRAM",
    name: "Instagram",
    notice:
      "Your Instagram account must be a Business or Creator account to connect.",
    icon: Instagram,
  },
  {
    id: "YOUTUBE",
    name: "YouTube",
    notice:
      "You must have a Google account linked to your YouTube channel to connect. Make sure to check the YouTube permissions box on the Google consent screen.",
    icon: Youtube,
  },
] as const;

const PLATFORM_ICONS: Record<
  SocialPlatform,
  React.ComponentType<{ className: string }>
> = {
  INSTAGRAM: Instagram,
  TIKTOK: Tiktok,
  YOUTUBE: Youtube,
};

const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

export const StepSevenSocialAccounts = () => {
  const { selectedAccountsParam, handleToggleAccount } = useSeriesWizard();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [selectedPlatform, setSelectedPlatform] =
    React.useState<SocialPlatform>("INSTAGRAM");

  const connectionsQuery = useQuery(trpc.social.getConnections.queryOptions());

  const connectMutation = useMutation(
    trpc.social.getOAuthUrl.mutationOptions({
      onSuccess: ({ url }) => {
        if (typeof window !== "undefined") {
          window.location.assign(url);
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleConnect = React.useCallback(
    (platform: SocialPlatform) => {
      connectMutation.mutate({
        platform,
        redirectUri: "/series?step=7",
      });
    },
    [connectMutation]
  );

  const allConnectionIds = React.useMemo(
    () => connectionsQuery.data?.map((c) => c.id) ?? [],
    [connectionsQuery.data]
  );

  const selectedIdSet = React.useMemo(() => {
    if (selectedAccountsParam === "__ALL__") {
      return new Set(allConnectionIds);
    }

    if (
      selectedAccountsParam === "none" ||
      selectedAccountsParam.length === 0
    ) {
      return new Set<string>();
    }

    return new Set(selectedAccountsParam.split(",").filter(Boolean));
  }, [selectedAccountsParam, allConnectionIds]);

  const connections = connectionsQuery.data ?? [];

  const activePlatformOption = React.useMemo(
    () =>
      SUPPORTED_PLATFORMS.find((p) => p.id === selectedPlatform) ??
      SUPPORTED_PLATFORMS[1],
    [selectedPlatform]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Connect Social Accounts"
        description="Connect and select the social media accounts where you want to publish your content"
        badge={<Badge variant="outline">Step 7 of 8</Badge>}
      />

      {/* Connected Accounts List */}
      <div className="flex flex-col gap-3">
        {(() => {
          if (connectionsQuery.isPending) {
            return (
              <div className="flex flex-col gap-3">
                <Item variant="outline">
                  <ItemMedia>
                    <Skeleton className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <Skeleton className="h-4 w-36" />
                  </ItemContent>
                  <ItemActions>
                    <Skeleton className="h-5 w-9" />
                  </ItemActions>
                </Item>
                <Item variant="outline">
                  <ItemMedia>
                    <Skeleton className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <Skeleton className="h-4 w-36" />
                  </ItemContent>
                  <ItemActions>
                    <Skeleton className="h-5 w-9" />
                  </ItemActions>
                </Item>
              </div>
            );
          }

          if (connections.length === 0) {
            return (
              <Card>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Share2 />
                    </EmptyMedia>
                    <EmptyTitle>No accounts connected yet</EmptyTitle>
                    <EmptyDescription>
                      Connect an account to automatically publish videos to your
                      channels.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </Card>
            );
          }

          return connections.map((conn: SocialConnectionItem) => {
            const Icon = PLATFORM_ICONS[conn.platform];
            const platformName = PLATFORM_NAMES[conn.platform];
            const isSelected = selectedIdSet.has(conn.id);

            return (
              <Item key={conn.id} variant="outline">
                <ItemMedia>
                  <Icon className="size-5 shrink-0" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <span>{platformName}</span>
                    <span className="font-normal text-muted-foreground">
                      {conn.platformUserName}
                    </span>
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      handleToggleAccount(conn.id, checked, allConnectionIds);
                    }}
                  />
                </ItemActions>
              </Item>
            );
          });
        })()}
      </div>

      {/* Connect another account button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Connect another account
        </Button>
      </div>

      {/* Footer note */}
      <p className="pt-2 text-center text-xs text-muted-foreground">
        You can connect your social media accounts later.
      </p>

      {/* Connect Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect social media account</DialogTitle>
            <DialogDescription>
              Choose one of the supported platforms.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-1">
            {/* 3-column platform grid */}
            <div className="grid grid-cols-3 gap-3">
              {SUPPORTED_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.id;

                return (
                  <Card
                    className="cursor-pointer select-none"
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                    }}
                    size="sm"
                    variant={isSelected ? "selected" : "interactive"}
                  >
                    <CardContent>
                      <div className="flex flex-col items-center justify-center gap-2.5 text-center">
                        <Icon className="size-8 shrink-0" />
                        <span className="text-sm font-semibold">
                          {platform.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Platform notice */}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {activePlatformOption.notice}
            </p>

            {/* Connect Action Button */}
            <Button
              size="lg"
              className="w-full"
              disabled={connectMutation.isPending}
              onClick={() => {
                handleConnect(selectedPlatform);
              }}
            >
              {connectMutation.isPending ? (
                <Spinner />
              ) : (
                `Connect ${activePlatformOption.name}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
