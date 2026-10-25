"use client";

import type {
  SocialConnectionItem,
  SocialPlatform,
} from "@faceless/contracts/social";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { Separator } from "@faceless/ui/components/separator";
import { Skeleton } from "@faceless/ui/components/skeleton";
import { Spinner } from "@faceless/ui/components/spinner";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import { queryClient, trpc } from "@/utils/trpc";

interface AccountConfig {
  id: string;
  name: string;
  platform: SocialPlatform;
  icon: React.ComponentType<{ className?: string }>;
}

const ACCOUNTS: readonly AccountConfig[] = [
  {
    id: "instagram",
    name: "Instagram",
    platform: "INSTAGRAM",
    icon: Instagram,
  },
  {
    id: "tiktok",
    name: "TikTok",
    platform: "TIKTOK",
    icon: Tiktok,
  },
  {
    id: "youtube",
    name: "YouTube",
    platform: "YOUTUBE",
    icon: Youtube,
  },
] as const;

export const ConnectedAccounts = () => {
  // TanStack Query Best Practice: perf-select-transform
  // Transform array into Map at the query level for memoized O(1) lookups and fewer re-renders
  const connectionsQuery = useQuery({
    ...trpc.social.getConnections.queryOptions(),
    select: React.useCallback(
      (connections: readonly SocialConnectionItem[]) => {
        const map = new Map<SocialPlatform, SocialConnectionItem>();

        for (const conn of connections) {
          map.set(conn.platform, conn);
        }

        return map;
      },
      []
    ),
  });

  // TanStack Query Best Practice: mut-invalidate-queries
  const disconnectMutation = useMutation(
    trpc.social.disconnect.mutationOptions({
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.social.getConnections.queryKey(),
        });
        toast.success(`Disconnected ${variables.platform.toLowerCase()}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

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
      connectMutation.mutate({ platform, redirectUri: "/settings" });
    },
    [connectMutation]
  );

  const handleDisconnect = React.useCallback(
    (platform: SocialPlatform) => {
      disconnectMutation.mutate({ platform });
    },
    [disconnectMutation]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected accounts</CardTitle>
        <CardDescription>
          Connect your social media accounts for automatic content distribution.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col">
        {ACCOUNTS.map((account, index) => {
          const Icon = account.icon;
          const connection = connectionsQuery.data?.get(account.platform);
          const isConnected = connection?.status === "CONNECTED";

          const isPending = isConnected
            ? disconnectMutation.isPending &&
              disconnectMutation.variables?.platform === account.platform
            : connectMutation.isPending &&
              connectMutation.variables?.platform === account.platform;

          return (
            <React.Fragment key={account.id}>
              {index > 0 && <Separator />}
              <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {account.name}
                    </span>
                    {isNonEmptyString(connection?.platformUserName) ? (
                      <span className="text-xs text-muted-foreground">
                        {connection.platformUserName}
                      </span>
                    ) : null}
                  </div>
                </div>

                {(() => {
                  if (connectionsQuery.isPending) {
                    return <Skeleton className="h-7 w-20" />;
                  }

                  if (isConnected) {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="size-2 animate-pulse rounded-full bg-success" />
                        <Button
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => {
                            handleDisconnect(account.platform);
                          }}
                        >
                          {isPending ? <Spinner /> : "Disconnect"}
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <Button
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        handleConnect(account.platform);
                      }}
                    >
                      {isPending ? <Spinner /> : "Connect"}
                    </Button>
                  );
                })()}
              </div>
            </React.Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};
