import { Skeleton } from "@faceless/ui/components/skeleton";

export const EpisodeStudioSkeleton = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <div className="flex items-center justify-between border-b pb-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-8 w-32" />
    </div>

    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[380px_1fr]">
      <div className="flex justify-center">
        <Skeleton className="aspect-[9/16] w-full max-w-[380px]" />
      </div>

      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  </div>
);
