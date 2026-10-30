"use client";

import { Badge } from "@faceless/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@faceless/ui/components/tabs";
import { Clapperboard, SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";

import { EpisodeStudioSkeleton } from "./_components/episode-studio-skeleton";
import { EpisodeVideoPreview } from "./_components/episode-video-preview";
import { LiveStyleCustomizer } from "./_components/live-style-customizer";
import { SceneBreakdownList } from "./_components/scene-breakdown-list";
import { StudioActionBar } from "./_components/studio-action-bar";
import {
  EpisodeStudioProvider,
  useEpisodeStudioContext,
} from "./_context/episode-studio-context";

const EpisodeStudioContent = () => {
  const { scenes, customization } = useEpisodeStudioContext();

  return (
    <div className="flex w-full flex-col gap-6">
      <StudioActionBar />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
        <div className="flex justify-center lg:sticky lg:top-4">
          <EpisodeVideoPreview />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Tabs defaultValue="scenes">
            <div className="flex items-center justify-between border-b pb-3">
              <TabsList variant="line">
                <TabsTrigger value="scenes">
                  <Clapperboard data-icon="inline-start" />
                  <span>Scenes & Script</span>
                  <Badge variant="secondary">{scenes.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="style">
                  <SlidersHorizontal data-icon="inline-start" />
                  <span>Style & Audio</span>
                  <Badge variant="outline">
                    {customization.captionStyleId.replaceAll("-", " ")}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scenes">
              <div className="pt-4">
                <SceneBreakdownList />
              </div>
            </TabsContent>

            <TabsContent value="style">
              <div className="pt-4">
                <LiveStyleCustomizer />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

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
