import { Skeleton } from "@faceless/ui/components/skeleton";

const Loading = () => (
  <div className="flex flex-col gap-6">
    {/* PageHeader skeleton */}
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-4 w-36" />
    </div>

    {/* API message */}
    <Skeleton className="h-4 w-48" />

    {/* Billing panel */}
    <Skeleton className="h-36 w-full max-w-2xl" />

    {/* File upload + list */}
    <div className="flex max-w-2xl flex-col gap-4">
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);

export default Loading;
