import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TipoReuniao = "comercial" | "operacional" | "qualidade" | "estrategica" | "crise";
export type AreaEnvolvida = "comercial" | "inter_i_tps" | "transporte" | "cdex" | "porto" | "qualidade" | "financeiro";
export type StatusReuniao = "realizada" | "em_andamento" | "cancelada";

export interface Reuniao {
  id: string;
  data_reuniao: string;
  cliente_id: string | null;
  tipo: TipoReuniao;
  area_envolvida: AreaEnvolvida;
  participantes: string | null;
  objetivo: string | null;
  resumo: string | null;
  status: StatusReuniao;
  proxima_reuniao: string | null;
  observacoes_estrategicas: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clientes?: { empresa: string };
}

export interface ReuniaoInsert {
  data_reuniao: string;
  cliente_id?: string | null;
  tipo: TipoReuniao;
  area_envolvida: AreaEnvolvida;
  participantes?: string;
  objetivo?: string;
  resumo?: string;
  status?: StatusReuniao;
  proxima_reuniao?: string | null;
  observacoes_estrategicas?: string;
}

export interface ReuniaoUpdate {
  data_reuniao?: string;
  cliente_id?: string | null;
  tipo?: TipoReuniao;
  area_envolvida?: AreaEnvolvida;
  participantes?: string | null;
  objetivo?: string | null;
  resumo?: string | null;
  status?: StatusReuniao;
  proxima_reuniao?: string | null;
  observacoes_estrategicas?: string | null;
}

export const TIPOS_REUNIAO: { value: TipoReuniao; label: string }[] = [
  { value: "comercial", label: "Comercial" },
  { value: "operacional", label: "Operacional" },
  { value: "qualidade", label: "Qualidade" },
  { value: "estrategica", label: "Estratégica" },
  { value: "crise", label: "Crise" },
];

export const AREAS_ENVOLVIDAS: { value: AreaEnvolvida; label: string }[] = [
  { value: "comercial", label: "Comercial" },
  { value: "inter_i_tps", label: "INTER I/TPS" },
  { value: "transporte", label: "Transporte" },
  { value: "cdex", label: "CDEX" },
  { value: "porto", label: "Porto" },
  { value: "qualidade", label: "Qualidade" },
  { value: "financeiro", label: "Financeiro" },
];

export const STATUS_REUNIAO: { value: StatusReuniao; label: string }[] = [
  { value: "realizada", label: "Realizada" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "cancelada", label: "Cancelada" },
];

export function useReunioes() {
  return useQuery({
    queryKey: ["reunioes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reunioes")
        .select(`
          *,
          clientes(empresa)
        `)
        .order("data_reuniao", { ascending: false });

      if (error) throw error;
      return data as Reuniao[];
    },
  });
}

export function useReuniao(id: string) {
  return useQuery({
    queryKey: ["reunioes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reunioes")
        .select(`
          *,
          clientes(empresa)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Reuniao;
    },
    enabled: !!id,
  });
}

export function useCreateReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReuniaoInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: reuniao, error } = await supabase
        .from("reunioes")
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return reuniao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reunioes"] });
      toast.success("Reunião registrada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao registrar reunião: " + error.message);
    },
  });
}

export function useUpdateReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReuniaoUpdate }) => {
      const { error } = await supabase
        .from("reunioes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reunioes"] });
      toast.success("Reunião atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar reunião: " + error.message);
    },
  });
}

export function useDeleteReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reunioes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reunioes"] });
      toast.success("Reunião excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir reunião: " + error.message);
    },
  });
}
