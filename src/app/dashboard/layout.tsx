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
      <main>
        <SidebarTrigger className="m-3" />
        {children}
      </main>
    </SidebarProvider>
  );
}
