import { Skeleton } from "@faceless/ui/components/skeleton";

const Loading = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-5 w-48" />
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-36 max-w-2xl" />
      <div className="flex max-w-2xl flex-col gap-6">
        <Skeleton className="h-44" />
        <Skeleton className="h-48" />
      </div>
    </div>
  </div>
);

export default Loading;
