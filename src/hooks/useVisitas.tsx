import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Visita = Tables<"visitas">;
export type VisitaInsert = TablesInsert<"visitas">;
export type VisitaUpdate = TablesUpdate<"visitas">;

export function useVisitas() {
  return useQuery({
    queryKey: ["visitas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitas")
        .select(`
          *,
          clientes(empresa)
        `)
        .order("data_visita", { ascending: false });

      if (error) throw error;
      return data as Visita[];
    },
  });
}

export function useCreateVisita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VisitaInsert) => {
      const { data: visita, error } = await supabase
        .from("visitas")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return visita;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitas"] });
      toast.success("Visita criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar visita: " + error.message);
    },
  });
}

export function useUpdateVisita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VisitaUpdate }) => {
      const { error } = await supabase
        .from("visitas")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitas"] });
      toast.success("Visita atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}