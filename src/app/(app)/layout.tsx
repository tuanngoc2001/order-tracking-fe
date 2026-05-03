import {
  AppHeader,
  AppLogo,
  AppNavMenu,
  SidebarLogoutButton,
} from "@/components/app-shell";
import { SupportFloatingButtons } from "@/components/support-floating-buttons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen>
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 px-4 py-4">
            <AppLogo />
          </SidebarHeader>

          <div className="flex h-full flex-col">
            <ScrollArea className="flex-1">
              <SidebarContent className="px-3 py-4">
                <AppNavMenu />
              </SidebarContent>
            </ScrollArea>

            <div className="border-t border-slate-200 px-3 py-4">
              <SidebarLogoutButton />
            </div>
          </div>
        </Sidebar>

        <SidebarInset className="bg-[#f8fbff]">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <SupportFloatingButtons />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
