"use client";

import { Suspense } from "react";

import { EpisodeStudioSkeleton } from "./_components/episode-studio-skeleton";
import { EpisodeVideoPreview } from "./_components/episode-video-preview";
import { LiveStyleCustomizer } from "./_components/live-style-customizer";
import { SceneBreakdownList } from "./_components/scene-breakdown-list";
import { StudioActionBar } from "./_components/studio-action-bar";
import { EpisodeStudioProvider } from "./_context/episode-studio-context";

const EpisodeStudio = () => (
  <EpisodeStudioProvider>
    <div className="flex flex-col gap-6">
      <StudioActionBar />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
        <div className="flex justify-center lg:sticky lg:top-16">
          <EpisodeVideoPreview />
        </div>

        <div className="flex flex-col gap-6">
          <LiveStyleCustomizer />
          <SceneBreakdownList />
        </div>
      </div>
    </div>
  </EpisodeStudioProvider>
);

const EpisodeStudioPage = () => (
  <Suspense fallback={<EpisodeStudioSkeleton />}>
    <EpisodeStudio />
  </Suspense>
);

export default EpisodeStudioPage;
