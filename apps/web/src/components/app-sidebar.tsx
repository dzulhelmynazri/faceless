"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@faceless/ui/components/sidebar";
import {
  Groceries,
  ListIcon,
  CommandIcon,
  Tv,
  Lighthouse,
  CreditCard,
  Settings,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const data = {
  navMain: [
    {
      title: "Series",
      url: "/series",
      icon: <Groceries />,
    },
    {
      title: "Videos",
      url: "/videos",
      icon: <Tv />,
    },
    {
      title: "Guides",
      url: "/guides",
      icon: <Lighthouse />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings />,
    },
    {
      title: "Test",
      url: "/test",
      icon: <ListIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Billings",
      url: "/billings",
      icon: <CreditCard />,
    },
  ],
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => (
  <Sidebar collapsible="offcanvas" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="ml-2 flex w-full items-center gap-2">
            <CommandIcon className="size-5!" />
            <span className="text-base font-semibold">Faceless</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain items={data.navMain} />
      <NavSecondary items={data.navSecondary} className="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
);
