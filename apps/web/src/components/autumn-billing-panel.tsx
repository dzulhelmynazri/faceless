/* oxlint-disable typescript/no-deprecated */
"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@faceless/ui/components/alert";
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
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@faceless/ui/components/item";
import { Skeleton } from "@faceless/ui/components/skeleton";
import { Spinner } from "@faceless/ui/components/spinner";
import { isNonEmptyString } from "@faceless/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCustomer } from "autumn-js/react";
import { AlertCircleIcon, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

type PlanId = "hobby" | "daily" | "pro";

interface AutumnOverdueAlertProps {
  isStripeCustomer: boolean;
  onUpdatePayment: () => void;
  isUpdating: boolean;
}

const AutumnOverdueAlert = ({
  isStripeCustomer,
  onUpdatePayment,
  isUpdating,
}: AutumnOverdueAlertProps) => (
  <Alert variant="destructive">
    <AlertCircleIcon data-icon="inline-start" />
    <AlertTitle>Payment Past Due</AlertTitle>
    <AlertDescription>
      Your recent subscription payment failed. Please update your payment method
      to restore your subscription features.
    </AlertDescription>
    {isStripeCustomer && (
      <AlertAction>
        <Button
          variant="outline"
          size="xs"
          onClick={onUpdatePayment}
          disabled={isUpdating}
        >
          Update Payment
        </Button>
      </AlertAction>
    )}
  </Alert>
);

interface AutumnCustomerStatusProps {
  customer?: ReturnType<typeof useCustomer>["data"];
  isLoading: boolean;
  activePlanId: string | null;
  isPastDue: boolean;
  seriesEntitlement?: {
    allowed: boolean;
    seriesCount: number;
    seriesLimit: number;
  };
}

const AutumnCustomerStatus = ({
  customer,
  isLoading,
  activePlanId,
  isPastDue,
  seriesEntitlement,
}: AutumnCustomerStatusProps) => {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <ItemGroup>
      <Item size="xs">
        <ItemContent>
          <ItemTitle>Customer ID</ItemTitle>
        </ItemContent>
        <ItemActions>
          <span className="font-mono text-xs font-medium text-foreground">
            {customer?.id}
          </span>
        </ItemActions>
      </Item>

      <Item size="xs">
        <ItemContent>
          <ItemTitle>Stripe ID</ItemTitle>
        </ItemContent>
        <ItemActions>
          <span className="font-mono text-xs text-foreground">
            {customer?.stripeId}
          </span>
        </ItemActions>
      </Item>

      <Item size="xs">
        <ItemContent>
          <ItemTitle>Active Plan</ItemTitle>
        </ItemContent>
        <ItemActions>
          {activePlanId === null ? (
            <span className="text-xs text-muted-foreground">None</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge variant="default">
                <span className="capitalize">{activePlanId}</span>
              </Badge>
              {isPastDue && (
                <Badge variant="destructive">
                  <span>Past Due</span>
                </Badge>
              )}
            </div>
          )}
        </ItemActions>
      </Item>

      {seriesEntitlement !== undefined && (
        <Item size="xs">
          <ItemContent>
            <ItemTitle>Active Series</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="font-medium text-foreground">
              {seriesEntitlement.seriesCount} / {seriesEntitlement.seriesLimit}{" "}
              Series
            </span>
          </ItemActions>
        </Item>
      )}

      {customer?.balances !== undefined &&
        Object.keys(customer.balances).length > 0 && (
          <Item size="xs">
            <ItemContent>
              <ItemTitle>Entitlements</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="font-medium text-foreground">
                {Object.entries(customer.balances)
                  .map(([id, b]) => `${b.remaining.toLocaleString()} ${id}`)
                  .join(", ")}
              </span>
            </ItemActions>
          </Item>
        )}
    </ItemGroup>
  );
};

interface AutumnBillingActionsProps {
  activePlanId: string | null;
  onAttachPlan: (planId: PlanId) => void;
  isAttaching: boolean;
  attachingPlanId: PlanId | null;
}

const AutumnBillingActions = ({
  activePlanId,
  onAttachPlan,
  isAttaching,
  attachingPlanId,
}: AutumnBillingActionsProps) => (
  <CardFooter>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="default"
        onClick={() => {
          onAttachPlan("hobby");
        }}
        disabled={isAttaching || activePlanId === "hobby"}
      >
        {isAttaching && attachingPlanId === "hobby" && (
          <Spinner data-icon="inline-start" />
        )}
        Hobby (RM39 / $19/mo)
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          onAttachPlan("daily");
        }}
        disabled={isAttaching || activePlanId === "daily"}
      >
        {isAttaching && attachingPlanId === "daily" && (
          <Spinner data-icon="inline-start" />
        )}
        Daily (RM129 / $39/mo)
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          onAttachPlan("pro");
        }}
        disabled={isAttaching || activePlanId === "pro"}
      >
        {isAttaching && attachingPlanId === "pro" && (
          <Spinner data-icon="inline-start" />
        )}
        Pro (RM229 / $69/mo)
      </Button>
    </div>
  </CardFooter>
);

export const AutumnBillingPanel = () => {
  const {
    data: customer,
    isLoading,
    refetch,
    attach,
    openCustomerPortal,
  } = useCustomer();

  const seriesEntitlementQuery = useQuery(
    trpc.billing.checkSeriesEntitlement.queryOptions()
  );

  const activeSubscription = customer?.subscriptions?.find(
    (sub) => sub.status === "active" || sub.pastDue
  );

  const activePlanId = activeSubscription?.planId ?? null;

  const isPastDue = activeSubscription?.pastDue === true;

  const attachPlanMutation = useMutation({
    mutationFn: async (planId: PlanId) => {
      const res = await attach({ planId });

      return { planId, res };
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async ({ planId, res }) => {
      const paymentUrl = res?.paymentUrl;

      if (isNonEmptyString(paymentUrl)) {
        toast.info("Redirecting to Stripe checkout...");
        window.location.assign(paymentUrl);

        return;
      }

      toast.success(`Successfully attached plan "${planId}"!`);
      await Promise.all([refetch(), seriesEntitlementQuery.refetch()]);
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => await openCustomerPortal(),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (res) => {
      if (isNonEmptyString(res?.url)) {
        window.location.assign(res.url);
      }
    },
  });

  const isStripeCustomer = isNonEmptyString(customer?.stripeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Autumn Billing Panel</CardTitle>
        <CardDescription>
          Live synchronization between Better Auth &amp; Autumn/Stripe
        </CardDescription>
        {isStripeCustomer && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                portalMutation.mutate();
              }}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ArrowUpRight data-icon="inline-start" />
              )}
              Customer Portal
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          {isPastDue && (
            <AutumnOverdueAlert
              isStripeCustomer={isStripeCustomer}
              onUpdatePayment={() => {
                portalMutation.mutate();
              }}
              isUpdating={portalMutation.isPending}
            />
          )}
          <AutumnCustomerStatus
            customer={customer}
            isLoading={isLoading || seriesEntitlementQuery.isLoading}
            activePlanId={activePlanId}
            isPastDue={isPastDue}
            seriesEntitlement={seriesEntitlementQuery.data}
          />
        </div>
      </CardContent>

      <AutumnBillingActions
        activePlanId={activePlanId}
        onAttachPlan={(planId) => {
          attachPlanMutation.mutate(planId);
        }}
        isAttaching={attachPlanMutation.isPending}
        attachingPlanId={attachPlanMutation.variables ?? null}
      />
    </Card>
  );
};
