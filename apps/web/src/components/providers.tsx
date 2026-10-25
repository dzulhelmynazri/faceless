"use client";

import { Toaster } from "@faceless/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AutumnProvider } from "autumn-js/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { queryClient } from "@/utils/trpc";

import { ThemeProvider } from "./theme-provider";

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <AutumnProvider useBetterAuth={true}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </AutumnProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
    <Toaster />
  </ThemeProvider>
);

export default Providers;
