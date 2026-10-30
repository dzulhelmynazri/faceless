"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
} from "@faceless/ui/components/item";
import { Skeleton } from "@faceless/ui/components/skeleton";

const SeriesDetailLoading = () => (
  <div className="flex flex-col gap-6">
    {/* Back button & Action Toolbar Skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-32" />

      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-7 w-34" />
      </div>
    </div>

    {/* Episode Feed Header Skeleton */}
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-6 w-32" />

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>

      {/* Episode Cards List Skeleton */}
      <div className="grid grid-cols-1 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Item key={index} variant="outline">
            <ItemMedia className="size-12" variant="image">
              <Skeleton className="size-full" />
            </ItemMedia>
            <ItemContent>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </ItemContent>
            <ItemActions>
              <Skeleton className="h-8 w-28" />
            </ItemActions>
          </Item>
        ))}
      </div>
    </div>
  </div>
);

export default SeriesDetailLoading;
