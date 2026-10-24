"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@faceless/ui/components/alert";
import { Badge } from "@faceless/ui/components/badge";
import { Button } from "@faceless/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@faceless/ui/components/card";
import { Spinner } from "@faceless/ui/components/spinner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2Icon, CheckIcon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export const OrgTestPanel = () => {
  const queryClient = useQueryClient();

  const activeOrg = authClient.useActiveOrganization();
  const orgList = useQuery(trpc.organization.list.queryOptions());

  const allUser = useQuery({
    ...trpc.organization.allUser.queryOptions(),
    retry: false,
  });

  const onlyAdmin = useQuery({
    ...trpc.organization.onlyAdmin.queryOptions(),
    retry: false,
  });

  const switchOrg = useMutation({
    mutationFn: async (organizationId: string) => {
      const res = await authClient.organization.setActive({ organizationId });

      if (res.error) {
        throw new Error(res.error.message ?? "Failed to switch organization");
      }

      return res.data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.organization.allUser.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.organization.onlyAdmin.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.organization.list.queryKey(),
        }),
      ]);
      toast.success("Organization switched");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Active Organization Selector Card */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Active Organization</CardTitle>
          <CardDescription>
            Switch the active organization context for the current session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orgList.data && orgList.data.length > 0 ? (
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {orgList.data.map(({ organization: org, role }) => {
                const isActive = activeOrg.data?.id === org.id;

                return (
                  <div
                    className="flex items-center justify-between gap-4 p-3"
                    key={org.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground uppercase">
                        {org.name.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {org.name}
                          </span>
                          <Badge variant="outline">
                            <span className="capitalize">{role}</span>
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          /{org.slug}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <Badge variant="secondary">
                          <CheckIcon data-icon="inline-start" />
                          Active
                        </Badge>
                      ) : (
                        <Button
                          disabled={switchOrg.isPending}
                          onClick={() => {
                            switchOrg.mutate(org.id);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          {switchOrg.isPending &&
                            switchOrg.variables === org.id && (
                              <Spinner data-icon="inline-start" />
                            )}
                          Switch
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No organizations found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 2. All Members Permission Card */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>All Organization Members Endpoint</CardTitle>
          <CardDescription>
            Verified by <code>orgProcedure</code> (all roles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allUser.isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner /> Checking permissions...
            </div>
          )}
          {allUser.isSuccess && (
            <Alert>
              <CheckCircle2Icon className="text-success" />
              <AlertTitle>Access Granted</AlertTitle>
              <AlertDescription>
                {allUser.data.message} • Role:{" "}
                <Badge variant="secondary">{allUser.data.role}</Badge>
              </AlertDescription>
            </Alert>
          )}
          {allUser.isError && (
            <Alert variant="destructive">
              <ShieldAlertIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{allUser.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 3. Admin / Owner Only Permission Card */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Admins & Owners Endpoint</CardTitle>
          <CardDescription>
            Verified by <code>orgAdminProcedure</code> (admin & owner only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onlyAdmin.isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner /> Checking permissions...
            </div>
          )}
          {onlyAdmin.isSuccess && (
            <Alert>
              <CheckCircle2Icon className="text-success" />
              <AlertTitle>Access Granted</AlertTitle>
              <AlertDescription>{onlyAdmin.data.message}</AlertDescription>
            </Alert>
          )}
          {onlyAdmin.isError && (
            <Alert variant="destructive">
              <ShieldAlertIcon />
              <AlertTitle>Blocked</AlertTitle>
              <AlertDescription>{onlyAdmin.error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
