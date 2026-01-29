import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type StatusTarefaAcao = "nao_iniciada" | "em_andamento" | "concluida" | "atrasada";

export interface TarefaAcao {
  id: string;
  acao_id: string;
  descricao: string;
  responsavel_id: string | null;
  data_inicio: string | null;
  data_final: string | null;
  status: StatusTarefaAcao;
  sla_horas: number | null;
  alerta_atraso: boolean;
  comentarios: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { nome: string };
  acoes_reuniao?: { acao: string; reuniao_id: string };
}

export interface TarefaAcaoInsert {
  acao_id: string;
  descricao: string;
  responsavel_id?: string | null;
  data_inicio?: string | null;
  data_final?: string | null;
  status?: StatusTarefaAcao;
  sla_horas?: number | null;
  comentarios?: string;
}

export interface TarefaAcaoUpdate {
  descricao?: string;
  responsavel_id?: string | null;
  data_inicio?: string | null;
  data_final?: string | null;
  status?: StatusTarefaAcao;
  sla_horas?: number | null;
  alerta_atraso?: boolean;
  comentarios?: string | null;
}

export const STATUS_TAREFA_ACAO: { value: StatusTarefaAcao; label: string; color: string }[] = [
  { value: "nao_iniciada", label: "Não Iniciada", color: "bg-muted" },
  { value: "em_andamento", label: "Em Andamento", color: "bg-primary/20" },
  { value: "concluida", label: "Concluída", color: "bg-success/20" },
  { value: "atrasada", label: "Atrasada", color: "bg-destructive/20" },
];

export function useTarefasAcao(acaoId?: string) {
  return useQuery({
    queryKey: ["tarefas_acao", acaoId],
    queryFn: async () => {
      let query = supabase
        .from("tarefas_acao")
        .select(`
          *,
          profiles:responsavel_id(nome),
          acoes_reuniao(acao, reuniao_id)
        `)
        .order("data_final", { ascending: true });

      if (acaoId) {
        query = query.eq("acao_id", acaoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TarefaAcao[];
    },
  });
}

export function useAllTarefasAcao() {
  return useQuery({
    queryKey: ["tarefas_acao", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas_acao")
        .select(`
          *,
          profiles:responsavel_id(nome),
          acoes_reuniao(acao, reuniao_id)
        `)
        .order("data_final", { ascending: true });

      if (error) throw error;
      return data as TarefaAcao[];
    },
  });
}

export function useTarefasAtrasadas() {
  return useQuery({
    queryKey: ["tarefas_acao", "atrasadas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas_acao")
        .select(`
          *,
          profiles:responsavel_id(nome),
          acoes_reuniao(acao, reuniao_id)
        `)
        .eq("status", "atrasada")
        .order("data_final", { ascending: true });

      if (error) throw error;
      return data as TarefaAcao[];
    },
  });
}

export function useCreateTarefaAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TarefaAcaoInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: tarefa, error } = await supabase
        .from("tarefas_acao")
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return tarefa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas_acao"] });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar tarefa: " + error.message);
    },
  });
}

export function useUpdateTarefaAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TarefaAcaoUpdate }) => {
      const { error } = await supabase
        .from("tarefas_acao")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas_acao"] });
      toast.success("Tarefa atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar tarefa: " + error.message);
    },
  });
}

export function useDeleteTarefaAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tarefas_acao")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas_acao"] });
      toast.success("Tarefa excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir tarefa: " + error.message);
    },
  });
}
