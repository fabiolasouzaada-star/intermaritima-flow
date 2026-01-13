import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PreAlertaUpload {
  id: string;
  nome_arquivo: string;
  created_at: string;
  created_by: string | null;
  processado: boolean;
  total_registros: number;
}

export interface PreAlertaItem {
  id: string;
  upload_id: string | null;
  navio: string;
  nv: string | null;
  eta: string | null;
  armador: string | null;
  cliente_nome: string;
  cliente_cnpj: string | null;
  cntr_numero: string | null;
  tipo_container: string | null;
  quantidade: number;
  tipo_carga: string | null;
  peso_bruto: number | null;
  cliente_id: string | null;
  is_cliente_intermaritima: boolean;
  status_comercial: string;
  comercial_responsavel: string | null;
  observacoes: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  clientes?: {
    id: string;
    empresa: string;
    responsavel_codigo: string | null;
  } | null;
}

export interface NavioAgregado {
  navio: string;
  nv: string | null;
  eta: string | null;
  armador: string | null;
  total_cntr: number;
  total_clientes: number;
  clientes_intermaritima: number;
  clientes_nao_cadastrados: number;
  tipos_container: string[];
  itens: PreAlertaItem[];
}

export interface PreAlertaFilters {
  dataInicio?: string;
  dataFim?: string;
  navio?: string;
  nv?: string;
  armador?: string;
  cliente?: string;
  clienteIntermaritima?: boolean | null;
  tipoContainer?: string;
  volumeMinimo?: number;
  statusComercial?: string;
  comercialResponsavel?: string;
}

export function usePreAlertaUploads() {
  return useQuery({
    queryKey: ["pre-alerta-uploads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pre_alerta_uploads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PreAlertaUpload[];
    },
  });
}

export function usePreAlertaItens(filters?: PreAlertaFilters) {
  return useQuery({
    queryKey: ["pre-alerta-itens", filters],
    queryFn: async () => {
      let query = supabase
        .from("pre_alerta_itens")
        .select(`
          *,
          clientes (
            id,
            empresa,
            responsavel_codigo
          )
        `)
        .order("eta", { ascending: true })
        .order("navio", { ascending: true });

      if (filters?.dataInicio) {
        query = query.gte("eta", filters.dataInicio);
      }
      if (filters?.dataFim) {
        query = query.lte("eta", filters.dataFim);
      }
      if (filters?.navio) {
        query = query.ilike("navio", `%${filters.navio}%`);
      }
      if (filters?.nv) {
        query = query.ilike("nv", `%${filters.nv}%`);
      }
      if (filters?.armador) {
        query = query.ilike("armador", `%${filters.armador}%`);
      }
      if (filters?.cliente) {
        query = query.ilike("cliente_nome", `%${filters.cliente}%`);
      }
      if (filters?.clienteIntermaritima === true) {
        query = query.eq("is_cliente_intermaritima", true);
      }
      if (filters?.clienteIntermaritima === false) {
        query = query.eq("is_cliente_intermaritima", false);
      }
      if (filters?.tipoContainer) {
        query = query.ilike("tipo_container", `%${filters.tipoContainer}%`);
      }
      if (filters?.statusComercial) {
        query = query.eq("status_comercial", filters.statusComercial);
      }
      if (filters?.comercialResponsavel) {
        query = query.eq("comercial_responsavel", filters.comercialResponsavel);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let items = data as PreAlertaItem[];
      
      // Filter by minimum volume after fetching
      if (filters?.volumeMinimo && filters.volumeMinimo > 0) {
        // Group by navio to calculate total and filter
        const navioTotals = items.reduce((acc, item) => {
          const key = `${item.navio}-${item.nv || ''}`;
          acc[key] = (acc[key] || 0) + item.quantidade;
          return acc;
        }, {} as Record<string, number>);

        items = items.filter(item => {
          const key = `${item.navio}-${item.nv || ''}`;
          return navioTotals[key] >= (filters.volumeMinimo || 0);
        });
      }

      return items;
    },
  });
}

export function useNaviosAgregados(filters?: PreAlertaFilters) {
  const { data: itens, isLoading, error } = usePreAlertaItens(filters);

  const naviosAgregados: NavioAgregado[] = [];

  if (itens) {
    const grouped = itens.reduce((acc, item) => {
      const key = `${item.navio}-${item.nv || ''}`;
      if (!acc[key]) {
        acc[key] = {
          navio: item.navio,
          nv: item.nv,
          eta: item.eta,
          armador: item.armador,
          total_cntr: 0,
          total_clientes: new Set<string>(),
          clientes_intermaritima: new Set<string>(),
          clientes_nao_cadastrados: new Set<string>(),
          tipos_container: new Set<string>(),
          itens: [],
        };
      }
      acc[key].total_cntr += item.quantidade;
      acc[key].total_clientes.add(item.cliente_nome);
      if (item.is_cliente_intermaritima) {
        acc[key].clientes_intermaritima.add(item.cliente_nome);
      } else {
        acc[key].clientes_nao_cadastrados.add(item.cliente_nome);
      }
      if (item.tipo_container) {
        acc[key].tipos_container.add(item.tipo_container);
      }
      acc[key].itens.push(item);
      return acc;
    }, {} as Record<string, any>);

    for (const key in grouped) {
      naviosAgregados.push({
        ...grouped[key],
        total_clientes: grouped[key].total_clientes.size,
        clientes_intermaritima: grouped[key].clientes_intermaritima.size,
        clientes_nao_cadastrados: grouped[key].clientes_nao_cadastrados.size,
        tipos_container: Array.from(grouped[key].tipos_container),
      });
    }
  }

  return { data: naviosAgregados, isLoading, error };
}

export function useCreatePreAlertaUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (nomeArquivo: string) => {
      const { data, error } = await supabase
        .from("pre_alerta_uploads")
        .insert({
          nome_arquivo: nomeArquivo,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-uploads"] });
    },
  });
}

export function useCreatePreAlertaItens() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itens: Omit<PreAlertaItem, "id" | "created_at" | "updated_at" | "clientes">[]) => {
      const itensComCreatedBy = itens.map(item => ({
        ...item,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("pre_alerta_itens")
        .insert(itensComCreatedBy)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-itens"] });
      toast.success("Dados importados com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao importar dados:", error);
      toast.error("Erro ao importar dados");
    },
  });
}

export function useUpdatePreAlertaItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PreAlertaItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("pre_alerta_itens")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-itens"] });
      toast.success("Registro atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao atualizar registro");
    },
  });
}

export function useDeletePreAlertaItens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uploadId: string) => {
      const { error } = await supabase
        .from("pre_alerta_itens")
        .delete()
        .eq("upload_id", uploadId);

      if (error) throw error;

      const { error: uploadError } = await supabase
        .from("pre_alerta_uploads")
        .delete()
        .eq("id", uploadId);

      if (uploadError) throw uploadError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-itens"] });
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-uploads"] });
      toast.success("Dados removidos com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover dados:", error);
      toast.error("Erro ao remover dados");
    },
  });
}

export function useDeleteNavioItens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ navio, nv }: { navio: string; nv: string | null }) => {
      let query = supabase
        .from("pre_alerta_itens")
        .delete()
        .eq("navio", navio);
      
      if (nv) {
        query = query.eq("nv", nv);
      } else {
        query = query.is("nv", null);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-itens"] });
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-uploads"] });
      toast.success("Navio excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir navio:", error);
      toast.error("Erro ao excluir navio");
    },
  });
}

export function useCleanupOldNavios() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const cutoffDate = tenDaysAgo.toISOString().split('T')[0];

      const { error } = await supabase
        .from("pre_alerta_itens")
        .delete()
        .lt("eta", cutoffDate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-itens"] });
      queryClient.invalidateQueries({ queryKey: ["pre-alerta-uploads"] });
    },
  });
}

export function usePreAlertaStats(filters?: PreAlertaFilters) {
  const { data: itens, isLoading } = usePreAlertaItens(filters);

  const stats = {
    totalNavios: 0,
    totalCntr: 0,
    totalClientes: 0,
    clientesNaoCadastrados: 0,
    navioMaiorVolume: { navio: "", volume: 0 },
  };

  if (itens) {
    const navios = new Set<string>();
    const clientes = new Set<string>();
    const clientesNaoCadastrados = new Set<string>();
    const volumePorNavio: Record<string, number> = {};

    itens.forEach(item => {
      navios.add(`${item.navio}-${item.nv || ''}`);
      clientes.add(item.cliente_nome);
      stats.totalCntr += item.quantidade;

      if (!item.is_cliente_intermaritima) {
        clientesNaoCadastrados.add(item.cliente_nome);
      }

      const navioKey = item.navio;
      volumePorNavio[navioKey] = (volumePorNavio[navioKey] || 0) + item.quantidade;
    });

    stats.totalNavios = navios.size;
    stats.totalClientes = clientes.size;
    stats.clientesNaoCadastrados = clientesNaoCadastrados.size;

    // Find ship with highest volume
    let maxVolume = 0;
    for (const [navio, volume] of Object.entries(volumePorNavio)) {
      if (volume > maxVolume) {
        maxVolume = volume;
        stats.navioMaiorVolume = { navio, volume };
      }
    }
  }

  return { stats, isLoading };
}
