import { Skeleton } from "@faceless/ui/components/skeleton";

export const SeriesWizardSkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Progress Bar Skeleton */}
    <div className="grid grid-cols-8 gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton className="h-2" key={index} />
      ))}
    </div>

    {/* Header Skeleton */}
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Content Grid Skeleton */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="flex flex-col gap-3 rounded-xl border p-4" key={index}>
          <div className="flex items-center gap-2">
            <Skeleton className="size-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>

    {/* Footer Skeleton */}
    <div className="flex items-center justify-between border-t pt-4">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-28" />
    </div>
  </div>
);
