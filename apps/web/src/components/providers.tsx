"use client";

import { Toaster } from "@faceless/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AutumnProvider } from "autumn-js/react";

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
      <AutumnProvider useBetterAuth={true}>{children}</AutumnProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
    <Toaster richColors />
  </ThemeProvider>
);

export default Providers;
