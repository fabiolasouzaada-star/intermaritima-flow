import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Oportunidade = Tables<"oportunidades">;
export type OportunidadeInsert = TablesInsert<"oportunidades">;
export type OportunidadeUpdate = TablesUpdate<"oportunidades">;

export function useOportunidades() {
  return useQuery({
    queryKey: ["oportunidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select(`
          *,
          clientes(empresa)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Oportunidade[];
    },
  });
}

export function useCreateOportunidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OportunidadeInsert) => {
      const { data: oportunidade, error } = await supabase
        .from("oportunidades")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
      toast.success("Oportunidade criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar oportunidade: " + error.message);
    },
  });
}

export function useUpdateOportunidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OportunidadeUpdate }) => {
      const { error } = await supabase
        .from("oportunidades")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
      toast.success("Oportunidade atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}