"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

import { items } from "@/components/AppSidebar/AppSidebarItems";
import { AppSidebarFooter } from "@/components/AppSidebar/AppSidebarFooter";

export function AppSidebar() {
  const { open } = useSidebar();

  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className={open ? "p-5" : ""}>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) =>
                item.subitem ? (
                  <SidebarMenuItem key={item.title}>
                    <Collapsible
                      defaultOpen
                      className="group/collapsible"
                      onOpenChange={(isOpen) => setSettingsOpen(isOpen)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <div className="flex w-full items-center">
                            <item.icon className="mr-2" />
                            <span>{item.title}</span>
                            <ChevronDown
                              className={`ml-auto transition-transform ${settingsOpen ? "rotate-180" : ""
                                }`}
                            />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {item.subitem.map((subitem) => (
                          <SidebarMenuSub key={subitem.title}>
                            <SidebarMenuButton asChild>
                              <a
                                href={subitem.url}
                                className="flex items-center space-x-2"
                              >
                                <subitem.icon />
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span>{subitem.title}</span></TooltipTrigger>
                                    <TooltipContent>{subitem.tooltip}</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuSub>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex items-center space-x-2"
                      >
                        <item.icon />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span>{item.title}</span></TooltipTrigger>
                            <TooltipContent>{item.tooltip}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
