import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate, Json } from "@/integrations/supabase/types";

export type ModeloProposta = Tables<"modelos_proposta">;
export type Proposta = Tables<"propostas"> & {
  clientes?: { empresa: string; cnpj?: string | null };
  modelos_proposta?: { nome: string; tipo: string };
  profiles?: { nome: string; email: string };
};
export type PropostaInsert = TablesInsert<"propostas">;
export type PropostaUpdate = TablesUpdate<"propostas">;
export type PropostaHistorico = Tables<"proposta_historico">;

// Estrutura de serviço individual
export interface ServicoItem {
  nome: string;
  unidade: string;
  valor: string;
  valorEditado?: string;
  selecionado?: boolean;
}

// Categoria com array de itens
export interface CategoriaServico {
  categoria: string;
  itens: ServicoItem[];
}

export function useModelosPropostas() {
  return useQuery({
    queryKey: ["modelos_proposta"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelos_proposta")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      return data as ModeloProposta[];
    },
  });
}

export function useModeloProposta(id: string) {
  return useQuery({
    queryKey: ["modelos_proposta", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelos_proposta")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ModeloProposta;
    },
    enabled: !!id,
  });
}

export function usePropostas() {
  return useQuery({
    queryKey: ["propostas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select(`
          *,
          clientes(empresa, cnpj),
          modelos_proposta(nome, tipo),
          profiles!propostas_responsavel_id_fkey(nome, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Proposta[];
    },
  });
}

export function useProposta(id: string) {
  return useQuery({
    queryKey: ["propostas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propostas")
        .select(`
          *,
          clientes(empresa, cnpj),
          modelos_proposta(nome, tipo, estrutura_servicos),
          profiles!propostas_responsavel_id_fkey(nome, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Proposta;
    },
    enabled: !!id,
  });
}

export function usePropostaHistorico(propostaId: string) {
  return useQuery({
    queryKey: ["proposta_historico", propostaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposta_historico")
        .select("*")
        .eq("proposta_id", propostaId)
        .order("versao", { ascending: false });

      if (error) throw error;
      return data as PropostaHistorico[];
    },
    enabled: !!propostaId,
  });
}

export function useCreateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<PropostaInsert, "numero_proposta" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Get numero_proposta from database function
      const { data: numeroData, error: numeroError } = await supabase.rpc("gerar_numero_proposta");
      if (numeroError) throw numeroError;

      const { data: proposta, error } = await supabase
        .from("propostas")
        .insert({
          ...data,
          numero_proposta: numeroData,
          created_by: user.id,
          responsavel_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return proposta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
      toast.success("Proposta criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar proposta: " + error.message);
    },
  });
}

export function useUpdateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, criarHistorico = false }: { 
      id: string; 
      data: PropostaUpdate;
      criarHistorico?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Get current proposta for history
      if (criarHistorico) {
        const { data: currentProposta } = await supabase
          .from("propostas")
          .select("*")
          .eq("id", id)
          .single();

        if (currentProposta) {
          const { error: histError } = await supabase
            .from("proposta_historico")
            .insert({
              proposta_id: id,
              versao: currentProposta.versao,
              alteracoes: data as unknown as Json,
              status_anterior: currentProposta.status,
              status_novo: data.status || currentProposta.status,
              created_by: user.id,
            });
          
          if (histError) console.error("Erro ao criar histórico:", histError);
        }
      }

      const updateData: PropostaUpdate = {
        ...data,
        versao: criarHistorico ? (data.versao || 1) + 1 : data.versao,
      };

      const { error } = await supabase
        .from("propostas")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
      toast.success("Proposta atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useDeleteProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("propostas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas"] });
      toast.success("Proposta excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });
}
