import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PropostaCliente {
  id: string;
  numero_proposta: string;
  cliente_id: string;
  servico: string;
  tipo_servico: string | null;
  status: string | null;
  data_proposta: string | null;
  vencimento_proposta: string | null;
  proposta_url: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  clientes?: { empresa: string; cnpj?: string | null };
}

export interface PropostaClienteInsert {
  numero_proposta: string;
  cliente_id: string;
  servico: string;
  tipo_servico?: string;
  status?: string;
  data_proposta?: string;
  vencimento_proposta?: string;
  proposta_url?: string;
  observacoes?: string;
}

export interface PropostaClienteUpdate {
  numero_proposta?: string;
  cliente_id?: string;
  servico?: string;
  tipo_servico?: string;
  status?: string;
  data_proposta?: string;
  vencimento_proposta?: string;
  proposta_url?: string;
  observacoes?: string;
}

export function usePropostasCliente() {
  return useQuery({
    queryKey: ["propostas_cliente"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas_cliente")
        .select(`
          *,
          clientes(empresa, cnpj)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropostaCliente[];
    },
  });
}

export function useCreatePropostaCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PropostaClienteInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: proposta, error } = await supabase
        .from("propostas_cliente")
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return proposta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas_cliente"] });
      toast.success("Proposta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar proposta: " + error.message);
    },
  });
}

export function useUpdatePropostaCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PropostaClienteUpdate }) => {
      const { error } = await supabase
        .from("propostas_cliente")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas_cliente"] });
      toast.success("Proposta atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useDeletePropostaCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("propostas_cliente")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas_cliente"] });
      toast.success("Proposta excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });
}
