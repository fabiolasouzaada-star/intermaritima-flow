import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Faturamento {
  id: string;
  mes: string;
  ano: number;
  cliente_de: string;
  cliente_para: string;
  gc: string | null;
  segmento: string | null;
  valor: number;
  unidade: string | null;
  setor: string | null;
  created_at: string;
  created_by: string | null;
}

export interface FaturamentoInsert {
  mes: string;
  ano: number;
  cliente_de?: string;
  cliente_para: string;
  gc?: string | null;
  segmento?: string | null;
  valor: number;
  unidade?: string | null;
  setor?: string | null;
  created_by?: string | null;
}

export function useFaturamento() {
  return useQuery({
    queryKey: ["faturamento"],
    queryFn: async () => {
      // Fetch ALL rows by paginating through the 1000-row limit
      const allData: Faturamento[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("faturamento")
          .select("*")
          .order("ano", { ascending: false })
          .order("mes", { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (data && data.length > 0) {
          allData.push(...(data as Faturamento[]));
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      return allData;
    },
  });
}

export function useImportFaturamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: FaturamentoInsert[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const withUser = rows.map(r => ({ ...r, created_by: user.id }));

      // Insert in batches of 500
      for (let i = 0; i < withUser.length; i += 500) {
        const batch = withUser.slice(i, i + 500);
        const { error } = await supabase.from("faturamento").insert(batch);
        if (error) throw error;
      }

      return withUser.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["faturamento"] });
      toast.success(`${count} registros importados com sucesso!`);
    },
    onError: (error) => {
      toast.error("Erro ao importar: " + error.message);
    },
  });
}

export function useDeleteFaturamentoByPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mes, ano }: { mes: string; ano: number }) => {
      const { error } = await supabase
        .from("faturamento")
        .delete()
        .eq("mes", mes)
        .eq("ano", ano);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturamento"] });
      toast.success("Dados do período removidos!");
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });
}
