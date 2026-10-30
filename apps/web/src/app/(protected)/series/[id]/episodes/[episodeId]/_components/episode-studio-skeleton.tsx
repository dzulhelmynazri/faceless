import { Skeleton } from "@faceless/ui/components/skeleton";

export const EpisodeStudioSkeleton = () => (
  <div className="flex w-full flex-col gap-6">
    {/* Studio Action Bar Skeleton */}
    <div className="flex items-center justify-between border-b pb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
    </div>

    {/* Main Grid Skeleton */}
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
      {/* Video Monitor Skeleton */}
      <div className="flex justify-center">
        <div className="w-full max-w-[360px] space-y-3">
          <Skeleton className="aspect-[9/16] w-full" />
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
              <Skeleton className="h-10" key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Content Skeleton */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-6 border-b pb-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    </div>
  </div>
);
