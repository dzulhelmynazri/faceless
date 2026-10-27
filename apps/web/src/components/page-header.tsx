import * as React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  /** Rendered inline after the title (e.g. a Badge) */
  badge?: React.ReactNode;
  /** Rendered in the trailing slot (e.g. carousel controls, action buttons) */
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  badge,
  children,
}: PageHeaderProps) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {badge}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);
