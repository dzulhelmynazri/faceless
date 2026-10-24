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
import { useMutation } from "@tanstack/react-query";
import { useCustomer } from "autumn-js/react";
import { AlertCircleIcon, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/utils/trpc";

type PlanId = "creator" | "business";

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
      to restore full credit allowances.
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
}

const AutumnCustomerStatus = ({
  customer,
  isLoading,
  activePlanId,
  isPastDue,
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

      {customer?.balances !== undefined &&
        Object.keys(customer.balances).length > 0 && (
          <Item size="xs">
            <ItemContent>
              <ItemTitle>Credits Balance</ItemTitle>
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
  onBurnCredits: () => void;
  isBurning: boolean;
}

const AutumnBillingActions = ({
  activePlanId,
  onAttachPlan,
  isAttaching,
  attachingPlanId,
  onBurnCredits,
  isBurning,
}: AutumnBillingActionsProps) => (
  <CardFooter>
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="default"
        onClick={() => {
          onAttachPlan("creator");
        }}
        disabled={isAttaching || activePlanId === "creator"}
      >
        {isAttaching && attachingPlanId === "creator" && (
          <Spinner data-icon="inline-start" />
        )}
        Creator (RM39 / $19/mo)
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          onAttachPlan("business");
        }}
        disabled={isAttaching || activePlanId === "business"}
      >
        {isAttaching && attachingPlanId === "business" && (
          <Spinner data-icon="inline-start" />
        )}
        Business (RM129 / $39/mo)
      </Button>

      <Button variant="secondary" onClick={onBurnCredits} disabled={isBurning}>
        {isBurning && <Spinner data-icon="inline-start" />}
        Burn 25 Credits
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

  const activeSubscription = customer?.subscriptions?.[0];

  const activePlanId =
    activeSubscription?.planId ?? activeSubscription?.plan?.id ?? null;

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
      await refetch();
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

  const consumeCreditsMutation = useMutation({
    ...trpc.billing.consumeCredits.mutationOptions(),
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: async (data) => {
      toast.success(
        `Deducted ${data.consumed} credits on server! Remaining: ${data.remaining.toLocaleString()}`
      );
      await refetch();
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
            isLoading={isLoading}
            activePlanId={activePlanId}
            isPastDue={isPastDue}
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
        onBurnCredits={() => {
          consumeCreditsMutation.mutate({ amount: 25 });
        }}
        isBurning={consumeCreditsMutation.isPending}
      />
    </Card>
  );
};
