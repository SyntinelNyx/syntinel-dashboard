import { User2, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function AppSidebarFooter() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Logout Failed",
          description: await response.json(),
        });
        return;
      }

      toast({
        title: "Logout Successful",
        description: "Successfully Logged Out",
      });
      router.push("/auth");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An Unknown Error Has Occurred";

      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: errorMessage,
      });
    }
  };

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <User2 /> {"Username"}
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/account")}
                className="cursor-pointer"
              >
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
