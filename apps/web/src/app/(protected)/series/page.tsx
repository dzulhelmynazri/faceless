"use client";

import * as React from "react";

import { SeriesProgressBar } from "./_components/series-progress-bar";
import { SeriesWizardFooter } from "./_components/series-wizard-footer";
import { SeriesWizardStepContent } from "./_components/series-wizard-step-content";
import { SeriesWizardProvider } from "./_context/series-wizard-context";

const SeriesWizard = () => (
  <SeriesWizardProvider>
    <div className="flex flex-col gap-6">
      <SeriesProgressBar />
      <SeriesWizardStepContent />
      <SeriesWizardFooter />
    </div>
  </SeriesWizardProvider>
);

const SeriesPage = () => (
  <React.Suspense fallback={null}>
    <SeriesWizard />
  </React.Suspense>
);

export default SeriesPage;
