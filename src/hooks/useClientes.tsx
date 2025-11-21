import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Cliente = Tables<"clientes">;
export type ClienteInsert = TablesInsert<"clientes">;
export type ClienteUpdate = TablesUpdate<"clientes">;

export interface Contato {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  sede: string | null;
  is_principal: boolean | null;
}

export interface ClienteServico {
  id: string;
  servico: string;
  descricao: string | null;
}

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          *,
          contatos:contatos_cliente(*),
          servicos:cliente_servicos(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    },
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(`
          *,
          contatos:contatos_cliente(*),
          servicos:cliente_servicos(*),
          oportunidades(*),
          contratos(*),
          visitas(*),
          tarefas(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClienteInsert) => {
      const { data: cliente, error } = await supabase
        .from("clientes")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return cliente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClienteUpdate }) => {
      const { error } = await supabase
        .from("clientes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir cliente: " + error.message);
    },
  });
}