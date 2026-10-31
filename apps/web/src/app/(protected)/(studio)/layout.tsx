import * as React from "react";

const StudioLayout = ({ children }: LayoutProps<"/">) => (
  <main className="min-h-screen w-full bg-background p-4 md:p-6 lg:p-8">
    {children}
  </main>
);

export default StudioLayout;
