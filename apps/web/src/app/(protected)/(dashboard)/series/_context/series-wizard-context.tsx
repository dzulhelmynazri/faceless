"use client";

import * as React from "react";

import { useSeriesWizardState } from "../_hooks/use-series-wizard-state";

export type SeriesWizardContextType = ReturnType<typeof useSeriesWizardState>;

const SeriesWizardContext = React.createContext<SeriesWizardContextType | null>(
  null
);

interface SeriesWizardProviderProps {
  children: React.ReactNode;
}

export const SeriesWizardProvider = ({
  children,
}: SeriesWizardProviderProps) => {
  const wizard = useSeriesWizardState();

  return <SeriesWizardContext value={wizard}>{children}</SeriesWizardContext>;
};

export const useSeriesWizard = (): SeriesWizardContextType => {
  const context = React.use(SeriesWizardContext);

  if (!context) {
    throw new Error(
      "useSeriesWizard must be used within a SeriesWizardProvider"
    );
  }

  return context;
};
