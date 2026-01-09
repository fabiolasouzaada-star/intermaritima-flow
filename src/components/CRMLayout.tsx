import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/CRMSidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import logoIntermaritima from "@/assets/logo-intermaritima.png";
import { useIsMobile } from "@/hooks/use-mobile";

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full">
        <CRMSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b bg-card flex items-center px-3 md:px-6 gap-2 md:gap-4 sticky top-0 z-40">
            <SidebarTrigger className="shrink-0" />
            <img 
              src={logoIntermaritima} 
              alt="Intermarítima" 
              className="h-6 md:h-8" 
            />
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <NotificationCenter />
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Comercial</span>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
