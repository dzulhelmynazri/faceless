"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@faceless/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

const NavMenuList = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={isActive}
              render={<Link href={item.url} />}
              tooltip={item.title}
            >
              {item.icon}
              {item.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const NavMenuFallback = ({ items }: { items: NavItem[] }) => (
  <SidebarMenu>
    {items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          render={<Link href={item.url} />}
          tooltip={item.title}
        >
          {item.icon}
          {item.title}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </SidebarMenu>
);

export const NavMain = ({ items }: { items: NavItem[] }) => (
  <SidebarGroup>
    <SidebarGroupContent>
      <React.Suspense fallback={<NavMenuFallback items={items} />}>
        <NavMenuList items={items} />
      </React.Suspense>
    </SidebarGroupContent>
  </SidebarGroup>
);
