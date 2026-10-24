"use client";

import { useQuery } from "@tanstack/react-query";

import { trpc } from "@/utils/trpc";

const getStatusText = (isLoading: boolean, isConnected: boolean): string => {
  if (isLoading) {
    return "Checking...";
  }

  if (isConnected) {
    return "Connected";
  }

  return "Disconnected";
};

const Home = () => {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const isConnected = Boolean(healthCheck.data);
  const statusText = getStatusText(healthCheck.isLoading, isConnected);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${isConnected ? "bg-primary" : "bg-destructive"}`}
            />
            <span className="text-sm text-muted-foreground">{statusText}</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
