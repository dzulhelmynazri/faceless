import { Button } from "@faceless/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@faceless/ui/components/empty";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const GuidesPage = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen />
        </EmptyMedia>
        <EmptyTitle>Guides & Tutorials</EmptyTitle>
        <EmptyDescription>
          Learn how to scale faceless video channels, optimize virality, and
          automate production workflows.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/videos" />}>
          View Videos
        </Button>
      </EmptyContent>
    </Empty>
  </div>
);

export default GuidesPage;
