import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Tarefa = Tables<"tarefas">;
export type TarefaInsert = TablesInsert<"tarefas">;
export type TarefaUpdate = TablesUpdate<"tarefas">;

export function useTarefas() {
  return useQuery({
    queryKey: ["tarefas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select(`
          *,
          clientes(empresa)
        `)
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      return data as Tarefa[];
    },
  });
}

export function useCreateTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TarefaInsert) => {
      const { data: tarefa, error } = await supabase
        .from("tarefas")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return tarefa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar tarefa: " + error.message);
    },
  });
}

export function useUpdateTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TarefaUpdate }) => {
      const { error } = await supabase
        .from("tarefas")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      toast.success("Tarefa atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}