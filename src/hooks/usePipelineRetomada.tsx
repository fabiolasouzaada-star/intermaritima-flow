import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PipelineStage = "para_contactar" | "em_contato" | "proposta_enviada" | "negociacao" | "retomado";

export interface PipelineRetomada {
  id: string;
  cliente_id: string;
  estagio: PipelineStage;
  observacoes: string | null;
  data_movimentacao: string;
  created_at: string;
  updated_at: string;
}

export function usePipelineRetomada() {
  return useQuery({
    queryKey: ["pipeline_retomada"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_retomada")
        .select("*")
        .order("data_movimentacao", { ascending: false });

      if (error) throw error;
      return data as PipelineRetomada[];
    },
  });
}

export function useCreatePipelineRetomada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { cliente_id: string; estagio: PipelineStage; observacoes?: string }) => {
      const { error } = await supabase
        .from("pipeline_retomada")
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline_retomada"] });
      toast.success("Cliente adicionado ao pipeline!");
    },
    onError: () => {
      toast.error("Erro ao adicionar cliente ao pipeline");
    },
  });
}

export function useUpdatePipelineRetomada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PipelineRetomada> }) => {
      const { error } = await supabase
        .from("pipeline_retomada")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline_retomada"] });
      toast.success("Pipeline atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar pipeline");
    },
  });
}

export function useDeletePipelineRetomada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pipeline_retomada")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline_retomada"] });
      toast.success("Removido do pipeline!");
    },
    onError: () => {
      toast.error("Erro ao remover do pipeline");
    },
  });
}
