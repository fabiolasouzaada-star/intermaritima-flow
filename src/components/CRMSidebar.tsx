import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  Calendar, 
  ClipboardList,
  CheckSquare,
  Grid3x3,
  LogOut,
  Target,
  TrendingUp,
  TrendingDown,
  ListTodo,
  Ship,
  MessagesSquare
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: Workflow },
  { title: "Pré-Alerta Navios", url: "/pre-alerta-navios", icon: Ship },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Visitas/Reuniões", url: "/visitas", icon: ClipboardList },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Plano de Ações", url: "/plano-acoes", icon: ListTodo },
  { title: "Reuniões & Plano de Ação", url: "/reunioes-plano-acao", icon: MessagesSquare },
  { title: "Qualidade de Dados", url: "/qualidade-dados", icon: ShieldCheck },
  { title: "Faturamento", url: "/faturamento", icon: TrendingUp },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const menuItemsFS = [
  { title: "Dashboard FS", url: "/dashboard-fs", icon: TrendingUp },
  { title: "Carteira FS", url: "/carteira-fs", icon: Users },
  { title: "Pipeline Retomada", url: "/pipeline-retomada", icon: Target },
];

const menuItemsFSViews = [
  { title: "Concorrentes", url: "/fs-concorrentes", icon: Target },
  { title: "Multiterminal", url: "/fs-multiterminal", icon: Grid3x3 },
  { title: "Importadores", url: "/fs-importadores", icon: TrendingUp },
  { title: "Exportadores", url: "/fs-exportadores", icon: TrendingDown },
  { title: "Logística", url: "/fs-logistica", icon: Workflow },
  { title: "Freight Forwarders", url: "/fs-freight-forwarders", icon: ClipboardList },
];

export function CRMSidebar() {
  const { open, isMobile } = useSidebar();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM Intermarítima</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Carteira FS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItemsFS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Views FS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItemsFSViews.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="w-full justify-start hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
                {open && <span>Sair</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
