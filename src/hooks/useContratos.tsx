import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Contrato = Tables<"contratos">;
export type ContratoInsert = TablesInsert<"contratos">;
export type ContratoUpdate = TablesUpdate<"contratos">;

export function useContratos() {
  return useQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes(empresa)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contrato[];
    },
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContratoInsert) => {
      const { data: contrato, error } = await supabase
        .from("contratos")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return contrato;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar contrato: " + error.message);
    },
  });
}

export function useUpdateContrato() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContratoUpdate }) => {
      const { error } = await supabase
        .from("contratos")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}