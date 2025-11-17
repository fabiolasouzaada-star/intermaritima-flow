import { 
  LayoutDashboard, 
  Users, 
  Workflow, 
  FileText, 
  Calendar, 
  ClipboardList,
  CheckSquare,
  Grid3x3,
  MessageSquareMore,
  BarChart3
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: Workflow },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Visitas", url: "/visitas", icon: ClipboardList },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare },
  { title: "Matriz Potencial", url: "/matriz", icon: Grid3x3 },
  { title: "Pós-Venda", url: "/pos-venda", icon: MessageSquareMore },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

export function CRMSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
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
      </SidebarContent>
    </Sidebar>
  );
}
