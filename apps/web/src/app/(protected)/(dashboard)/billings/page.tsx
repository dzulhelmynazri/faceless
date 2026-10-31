"use client";

import { Skeleton } from "@faceless/ui/components/skeleton";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/page-header";

const AutumnBillingPanel = dynamic(
  async () =>
    await import("@/components/autumn-billing-panel").then(
      (mod) => mod.AutumnBillingPanel
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" />,
  }
);

const BillingsPage = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Billing & Plans"
      description="Manage your subscription, plan quotas, and payment methods."
    />
    <AutumnBillingPanel />
  </div>
);

export default BillingsPage;
