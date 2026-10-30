import type * as React from "react";

interface EpisodeStudioLayoutProps {
  children: React.ReactNode;
}

const EpisodeStudioLayout = ({ children }: EpisodeStudioLayoutProps) => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>
);

export default EpisodeStudioLayout;
