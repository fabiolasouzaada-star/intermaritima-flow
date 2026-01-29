import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AreaEnvolvida } from "./useReunioes";

export type PrioridadeAcaoReuniao = "alta" | "media" | "baixa";
export type StatusAcaoReuniao = "nao_iniciada" | "em_andamento" | "concluida" | "atrasada";
export type ImpactoAcao = "financeiro" | "operacional" | "relacionamento_cliente" | "compliance";

export interface AcaoReuniao {
  id: string;
  reuniao_id: string;
  cliente_id: string | null;
  area_responsavel: AreaEnvolvida;
  acao: string;
  responsavel_id: string | null;
  prazo: string | null;
  prioridade: PrioridadeAcaoReuniao;
  status: StatusAcaoReuniao;
  impacto: ImpactoAcao | null;
  comentarios: string | null;
  data_conclusao: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clientes?: { empresa: string };
  profiles?: { nome: string };
  reunioes?: { data_reuniao: string; tipo: string; clientes?: { empresa: string } };
}

export interface AcaoReuniaoInsert {
  reuniao_id: string;
  cliente_id?: string | null;
  area_responsavel: AreaEnvolvida;
  acao: string;
  responsavel_id?: string | null;
  prazo?: string | null;
  prioridade?: PrioridadeAcaoReuniao;
  status?: StatusAcaoReuniao;
  impacto?: ImpactoAcao | null;
  comentarios?: string;
}

export interface AcaoReuniaoUpdate {
  area_responsavel?: AreaEnvolvida;
  acao?: string;
  responsavel_id?: string | null;
  prazo?: string | null;
  prioridade?: PrioridadeAcaoReuniao;
  status?: StatusAcaoReuniao;
  impacto?: ImpactoAcao | null;
  comentarios?: string | null;
  data_conclusao?: string | null;
}

export const PRIORIDADES_ACAO: { value: PrioridadeAcaoReuniao; label: string; color: string }[] = [
  { value: "alta", label: "Alta", color: "bg-destructive text-destructive-foreground" },
  { value: "media", label: "Média", color: "bg-warning text-warning-foreground" },
  { value: "baixa", label: "Baixa", color: "bg-muted text-muted-foreground" },
];

export const STATUS_ACAO: { value: StatusAcaoReuniao; label: string; color: string }[] = [
  { value: "nao_iniciada", label: "Não Iniciada", color: "bg-muted" },
  { value: "em_andamento", label: "Em Andamento", color: "bg-primary/20" },
  { value: "concluida", label: "Concluída", color: "bg-success/20" },
  { value: "atrasada", label: "Atrasada", color: "bg-destructive/20" },
];

export const IMPACTOS_ACAO: { value: ImpactoAcao; label: string }[] = [
  { value: "financeiro", label: "Financeiro" },
  { value: "operacional", label: "Operacional" },
  { value: "relacionamento_cliente", label: "Relacionamento com Cliente" },
  { value: "compliance", label: "Compliance" },
];

export function useAcoesReuniao(reuniaoId?: string) {
  return useQuery({
    queryKey: ["acoes_reuniao", reuniaoId],
    queryFn: async () => {
      let query = supabase
        .from("acoes_reuniao")
        .select(`
          *,
          clientes(empresa),
          profiles:responsavel_id(nome),
          reunioes(data_reuniao, tipo, clientes(empresa))
        `)
        .order("created_at", { ascending: false });

      if (reuniaoId) {
        query = query.eq("reuniao_id", reuniaoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AcaoReuniao[];
    },
  });
}

export function useAllAcoesReuniao() {
  return useQuery({
    queryKey: ["acoes_reuniao", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes_reuniao")
        .select(`
          *,
          clientes(empresa),
          profiles:responsavel_id(nome),
          reunioes(data_reuniao, tipo, clientes(empresa))
        `)
        .order("prazo", { ascending: true });

      if (error) throw error;
      return data as AcaoReuniao[];
    },
  });
}

export function useCreateAcaoReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcaoReuniaoInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: acao, error } = await supabase
        .from("acoes_reuniao")
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return acao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acoes_reuniao"] });
      toast.success("Ação criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar ação: " + error.message);
    },
  });
}

export function useUpdateAcaoReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AcaoReuniaoUpdate }) => {
      // Se status for concluída, definir data_conclusao
      const updateData = { ...data };
      if (data.status === "concluida" && !data.data_conclusao) {
        updateData.data_conclusao = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("acoes_reuniao")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acoes_reuniao"] });
      toast.success("Ação atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar ação: " + error.message);
    },
  });
}

export function useDeleteAcaoReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("acoes_reuniao")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acoes_reuniao"] });
      toast.success("Ação excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir ação: " + error.message);
    },
  });
}
