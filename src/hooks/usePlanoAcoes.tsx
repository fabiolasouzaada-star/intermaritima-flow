import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type StatusAcao = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type PrioridadeAcao = "baixa" | "media" | "alta" | "urgente";

export type TipoServicoAcao = "ALF" | "TR" | "AG" | "OP" | "EXP";

export interface PlanoAcao {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  status: StatusAcao;
  prioridade: PrioridadeAcao;
  data_limite: string | null;
  responsavel_id: string | null;
  observacoes: string | null;
  tipo_servico: TipoServicoAcao | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clientes?: { empresa: string };
  profiles?: { nome: string };
  criador?: { nome: string; email: string };
}

export interface PlanoAcaoInsert {
  cliente_id: string;
  titulo: string;
  descricao?: string;
  status?: StatusAcao;
  prioridade?: PrioridadeAcao;
  data_limite?: string;
  responsavel_id?: string;
  observacoes?: string;
  tipo_servico?: TipoServicoAcao;
}

export interface PlanoAcaoUpdate {
  titulo?: string;
  descricao?: string | null;
  status?: StatusAcao;
  prioridade?: PrioridadeAcao;
  data_limite?: string | null;
  responsavel_id?: string | null;
  observacoes?: string | null;
  tipo_servico?: TipoServicoAcao | null;
}

export function usePlanoAcoes() {
  return useQuery({
    queryKey: ["plano_acoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plano_acoes")
        .select(`
          *,
          clientes(empresa),
          profiles:responsavel_id(nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Buscar informações do criador separadamente
      const creatorIds = [...new Set(data?.map(a => a.created_by).filter(Boolean))] as string[];
      let criadoresMap: Record<string, { nome: string; email: string }> = {};
      
      if (creatorIds.length > 0) {
        const { data: criadores } = await supabase
          .from("profiles")
          .select("id, nome, email")
          .in("id", creatorIds);
        
        if (criadores) {
          criadoresMap = criadores.reduce((acc, c) => {
            acc[c.id] = { nome: c.nome, email: c.email };
            return acc;
          }, {} as Record<string, { nome: string; email: string }>);
        }
      }
      
      return (data || []).map(acao => ({
        ...acao,
        criador: acao.created_by ? criadoresMap[acao.created_by] : undefined
      })) as PlanoAcao[];
    },
  });
}

export function usePlanoAcao(id: string) {
  return useQuery({
    queryKey: ["plano_acoes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plano_acoes")
        .select(`
          *,
          clientes(empresa),
          profiles(nome)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PlanoAcao;
    },
    enabled: !!id,
  });
}

export function useCreatePlanoAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlanoAcaoInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: acao, error } = await supabase
        .from("plano_acoes")
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
      queryClient.invalidateQueries({ queryKey: ["plano_acoes"] });
      toast.success("Ação criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar ação: " + error.message);
    },
  });
}

export function useUpdatePlanoAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlanoAcaoUpdate }) => {
      const { error } = await supabase
        .from("plano_acoes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plano_acoes"] });
      toast.success("Ação atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}

export function useDeletePlanoAcao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("plano_acoes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plano_acoes"] });
      toast.success("Ação excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });
}
