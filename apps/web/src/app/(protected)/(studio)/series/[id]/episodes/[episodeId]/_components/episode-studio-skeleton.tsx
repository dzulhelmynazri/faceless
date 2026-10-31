import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@faceless/ui/components/card";
import { Skeleton } from "@faceless/ui/components/skeleton";

export const EpisodeStudioSkeleton = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
    {/* Studio Action Bar Skeleton */}
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      {/* Left: Back Link */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-28" />
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-36" />
      </div>
    </div>

    {/* Main Grid Skeleton */}
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
      {/* Video Monitor Skeleton */}
      <div className="flex justify-center lg:sticky lg:top-4">
        <div className="aspect-[9/16] w-full overflow-hidden rounded-xl shadow-lg">
          <Skeleton className="size-full" />
        </div>
      </div>

      {/* Style Customizer & Metadata Skeleton */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Metadata Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Title field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>

              {/* Description field */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="mt-4 h-7 w-full" />
          </CardFooter>
        </Card>

        {/* Live Style Customizer Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {/* Caption Style Preset: 3x3 Grid */}
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3 w-28" />
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              </div>

              {/* Background Music Selector */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-7 w-full" />
              </div>

              {/* Glitch Effect Switch */}
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default EpisodeStudioSkeleton;
