import { SidebarInset, SidebarProvider } from "@faceless/ui/components/sidebar";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

type CustomProperties = Record<`--${string}`, string>;

const sidebarStyle: React.CSSProperties & CustomProperties = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
};

const ProtectedLayout = ({ children }: LayoutProps<"/">) => (
  <SidebarProvider style={sidebarStyle}>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {children}
      </div>
    </SidebarInset>
  </SidebarProvider>
);

export default ProtectedLayout;
