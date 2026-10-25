"use client";

import type {
  SocialConnectionItem,
  SocialPlatform,
} from "@faceless/contracts/social";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import { Card } from "@faceless/ui/components/card";
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
import { cn } from "@faceless/ui/lib/utils";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

interface StepSevenSocialAccountsProps {
  selectedAccountsParam: string;
  onToggleAccount: (id: string, checked: boolean, allIds: string[]) => void;
}

interface SupportedPlatformOption {
  id: SocialPlatform;
  name: string;
  notice: string;
  icon: React.ComponentType<{ className?: string }>;
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

const getPlatformIcon = (platform: SocialPlatform) => {
  switch (platform) {
    case "INSTAGRAM": {
      return Instagram;
    }

    case "TIKTOK": {
      return Tiktok;
    }

    case "YOUTUBE": {
      return Youtube;
    }

    default: {
      return Instagram;
    }
  }
};

const getPlatformName = (platform: SocialPlatform) => {
  switch (platform) {
    case "INSTAGRAM": {
      return "Instagram";
    }

    case "TIKTOK": {
      return "TikTok";
    }

    case "YOUTUBE": {
      return "YouTube";
    }

    default: {
      return platform;
    }
  }
};

export const StepSevenSocialAccounts = ({
  selectedAccountsParam,
  onToggleAccount,
}: StepSevenSocialAccountsProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [selectedPlatform, setSelectedPlatform] =
    React.useState<SocialPlatform>("INSTAGRAM");

  const connectionsQuery = useQuery({
    ...trpc.social.getConnections.queryOptions(),
  });

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
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Connect Social Accounts
          </h1>
          <Badge variant="outline">Step 7 of 8</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect and select the social media accounts where you want to publish
          your content
        </p>
      </div>

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
            const Icon = getPlatformIcon(conn.platform);
            const platformName = getPlatformName(conn.platform);
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
                      onToggleAccount(conn.id, checked, allConnectionIds);
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
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-5 transition-all outline-none select-none",
                      isSelected
                        ? "border-primary bg-card ring-1 ring-primary"
                        : "border-border/80 bg-card hover:bg-muted/40"
                    )}
                  >
                    <Icon className="size-8 shrink-0 text-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {platform.name}
                    </span>
                  </button>
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
