import { cookies } from "next/headers";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarState = cookies().get("sidebar:state");

  let defaultOpen = false;
  if (sidebarState) {
    defaultOpen = sidebarState.value === "false";
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarTrigger className="m-3" />
      <main className="flex h-full w-full items-center justify-center px-4">
        {children}
      </main>
    </SidebarProvider>
  );
}
