"use client";

import { Suspense } from "react";

import { EpisodeMetadataCard } from "./_components/episode-metadata-card";
import { EpisodeStudioSkeleton } from "./_components/episode-studio-skeleton";
import { EpisodeVideoPreview } from "./_components/episode-video-preview";
import { LiveStyleCustomizer } from "./_components/live-style-customizer";
import { StudioActionBar } from "./_components/studio-action-bar";
import { EpisodeStudioProvider } from "./_context/episode-studio-context";

const EpisodeStudioContent = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <StudioActionBar />

    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
      {/* Left Column: Vertical Video Monitor */}
      <div className="flex justify-center lg:sticky lg:top-4">
        <EpisodeVideoPreview />
      </div>

      {/* Right Column: Style Customizer & Metadata Copy */}
      <div className="flex min-w-0 flex-col gap-6">
        <EpisodeMetadataCard />
        <LiveStyleCustomizer />
      </div>
    </div>
  </div>
);

const EpisodeStudio = () => (
  <EpisodeStudioProvider>
    <EpisodeStudioContent />
  </EpisodeStudioProvider>
);

const EpisodeStudioPage = () => (
  <Suspense fallback={<EpisodeStudioSkeleton />}>
    <EpisodeStudio />
  </Suspense>
);

export default EpisodeStudioPage;
