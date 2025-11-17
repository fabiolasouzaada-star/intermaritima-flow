import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/CRMSidebar";
import logoIntermaritima from "@/assets/logo-intermaritima.png";

export function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CRMSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 gap-4">
            <SidebarTrigger />
            <img src={logoIntermaritima} alt="Intermarítima" className="h-8" />
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Comercial</span>
            </div>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
