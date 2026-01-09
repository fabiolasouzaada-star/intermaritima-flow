import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, addDays, isAfter, isBefore, parseISO } from "date-fns";

export interface Notification {
  id: string;
  type: "tarefa_atrasada" | "contrato_vencendo" | "visita_semana" | "oportunidade_sem_retorno";
  title: string;
  description: string;
  link?: string;
  date?: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const notifications: Notification[] = [];
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // 1. Tarefas atrasadas
      const { data: tarefasAtrasadas } = await supabase
        .from("tarefas")
        .select("id, titulo, data_vencimento, clientes(empresa)")
        .lt("data_vencimento", todayStr)
        .neq("status", "concluida")
        .neq("status", "cancelada");

      tarefasAtrasadas?.forEach((tarefa) => {
        notifications.push({
          id: `tarefa-${tarefa.id}`,
          type: "tarefa_atrasada",
          title: "Tarefa Atrasada",
          description: `${tarefa.titulo}${tarefa.clientes?.empresa ? ` - ${tarefa.clientes.empresa}` : ""}`,
          link: "/tarefas",
          date: tarefa.data_vencimento || undefined,
        });
      });

      // 2. Contratos a vencer nos próximos 30 dias
      const thirtyDaysFromNow = addDays(today, 30);
      const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

      const { data: contratosVencendo } = await supabase
        .from("contratos")
        .select("id, numero_contrato, data_fim, clientes(empresa)")
        .gte("data_fim", todayStr)
        .lte("data_fim", thirtyDaysStr)
        .eq("status", "ativo");

      contratosVencendo?.forEach((contrato) => {
        notifications.push({
          id: `contrato-${contrato.id}`,
          type: "contrato_vencendo",
          title: "Contrato a Vencer",
          description: `${contrato.numero_contrato} - ${contrato.clientes?.empresa || ""}`,
          link: "/contratos",
          date: contrato.data_fim || undefined,
        });
      });

      // 3. Visitas/reuniões da semana
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const weekStartStr = weekStart.toISOString().split("T")[0];
      const weekEndStr = weekEnd.toISOString().split("T")[0];

      const { data: visitasSemana } = await supabase
        .from("visitas")
        .select("id, objetivo, data_visita, clientes(empresa)")
        .gte("data_visita", weekStartStr)
        .lte("data_visita", weekEndStr)
        .in("status", ["agendada", "a_agendar"]);

      visitasSemana?.forEach((visita) => {
        notifications.push({
          id: `visita-${visita.id}`,
          type: "visita_semana",
          title: "Visita da Semana",
          description: `${visita.clientes?.empresa || "Visita"}${visita.objetivo ? ` - ${visita.objetivo}` : ""}`,
          link: "/visitas",
          date: visita.data_visita,
        });
      });

      // 4. Oportunidades sem retorno (mais de 30 dias sem atualização)
      const thirtyDaysAgo = addDays(today, -30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

      const { data: oportunidadesSemRetorno } = await supabase
        .from("oportunidades")
        .select("id, titulo, updated_at, clientes(empresa)")
        .lt("updated_at", thirtyDaysAgoStr)
        .not("status", "in", "(ganho,perdido,sem_retorno)");

      oportunidadesSemRetorno?.forEach((oportunidade) => {
        notifications.push({
          id: `oportunidade-${oportunidade.id}`,
          type: "oportunidade_sem_retorno",
          title: "Oportunidade Sem Retorno",
          description: `${oportunidade.titulo} - ${oportunidade.clientes?.empresa || ""}`,
          link: "/pipeline",
          date: oportunidade.updated_at,
        });
      });

      return notifications;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCheckAndMoveStaleOpportunities() {
  return useQuery({
    queryKey: ["check-stale-opportunities"],
    queryFn: async () => {
      // Call the database function to move stale opportunities
      const { error } = await supabase.rpc("check_stale_opportunities");
      if (error) {
        console.error("Error checking stale opportunities:", error);
      }
      return true;
    },
    refetchInterval: 300000, // Check every 5 minutes
  });
}
