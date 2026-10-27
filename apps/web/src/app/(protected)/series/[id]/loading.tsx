import { Card, CardHeader } from "@faceless/ui/components/card";
import { Skeleton } from "@faceless/ui/components/skeleton";

const SeriesDetailLoading = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center">
      <Skeleton className="h-9 w-32" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    </Card>
  </div>
);

export default SeriesDetailLoading;
