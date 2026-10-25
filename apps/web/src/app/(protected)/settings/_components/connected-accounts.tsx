import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { Separator } from "@faceless/ui/components/separator";
import { Instagram, Tiktok, Youtube } from "@faceless/ui/socials";
import * as React from "react";

const ACCOUNTS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Tiktok,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
  },
] as const;

export const ConnectedAccounts = () => (
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

        return (
          <React.Fragment key={account.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                  <Icon className="size-5" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {account.name}
                </span>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </React.Fragment>
        );
      })}
    </CardContent>
  </Card>
);
