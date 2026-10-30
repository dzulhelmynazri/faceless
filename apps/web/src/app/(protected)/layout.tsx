import { SidebarInset, SidebarProvider } from "@faceless/ui/components/sidebar";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { auth } from "@/services";

export const instant = false;

type CustomProperties = Record<`--${string}`, string>;

const sidebarStyle: React.CSSProperties & CustomProperties = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
};

const ProtectedLayout = async ({ children }: LayoutProps<"/">) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <SidebarProvider style={sidebarStyle}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
