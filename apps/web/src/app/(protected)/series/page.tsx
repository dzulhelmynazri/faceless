"use client";

import { Suspense } from "react";

import { SeriesProgressBar } from "./_components/series-progress-bar";
import { SeriesWizardFooter } from "./_components/series-wizard-footer";
import { SeriesWizardSkeleton } from "./_components/series-wizard-skeleton";
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
  <Suspense fallback={<SeriesWizardSkeleton />}>
    <SeriesWizard />
  </Suspense>
);

export default SeriesPage;
