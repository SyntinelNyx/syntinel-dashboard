"use client";
import {
  Blocks,
  Bug,
  ChevronsLeftRightEllipsis,
  CircleFadingPlus,
  Container,
  HardDrive,
  Home,
  Settings,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible } from "@/components/ui/collapsible";

import { AppSidebarFooter } from "@/components/AppSidebar/AppSidebarFooter";

const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Assets",
    url: "/dashboard/assets",
    icon: HardDrive,
  },
  {
    title: "Vulnerabilities",
    url: "/dashboard/vulnerabilities",
    icon: Bug,
  },
  {
    title: "Environments",
    url: "/dashboard/environments",
    icon: Container,
  },
  {
    title: "Modules",
    url: "/dashboard/modules",
    icon: ChevronsLeftRightEllipsis,
  },
  {
    title: "Snapshots",
    url: "/dashboard/snapshots",
    icon: CircleFadingPlus,
  },
  {
    title: "Plugins",
    url: "/dashboard/plugins",
    icon: Blocks,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className={open ? "p-5" : ""}>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
