import { useState, useMemo } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  Users, 
  UserX, 
  TrendingUp, 
  DollarSign,
  Target,
  FileCheck,
  ClipboardList,
  PhoneCall,
  PackageSearch,
  Percent,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useContratos } from "@/hooks/useContratos";
import { useVisitas } from "@/hooks/useVisitas";
import { useTarefas } from "@/hooks/useTarefas";
import { useFaturamento } from "@/hooks/useFaturamento";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const MESES_ORDEM: Record<string, number> = {
  Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
  Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12,
};

export default function Dashboard() {
  const [comercialFilter, setComercialFilter] = useState("todos");
  
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: oportunidades, isLoading: loadingOportunidades } = useOportunidades();
  const { data: contratos, isLoading: loadingContratos } = useContratos();
  const { data: visitas, isLoading: loadingVisitas } = useVisitas();
  const { data: tarefas, isLoading: loadingTarefas } = useTarefas();
  const { data: faturamento, isLoading: loadingFaturamento } = useFaturamento();

  const isLoading = loadingClientes || loadingOportunidades || loadingContratos || loadingVisitas || loadingTarefas || loadingFaturamento;

  // Faturamento metrics
  const faturamentoTotal = useMemo(() => {
    if (!faturamento) return 0;
    return faturamento.reduce((acc, f) => acc + Number(f.valor), 0);
  }, [faturamento]);

  const faturamentoPorMes = useMemo(() => {
    if (!faturamento) return [];
    const map = new Map<string, number>();
    faturamento.forEach(f => {
      const key = `${f.mes}/${f.ano}`;
      map.set(key, (map.get(key) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([key, valor]) => {
        const [mes, ano] = key.split("/");
        return { name: key, valor, sortKey: Number(ano) * 100 + (MESES_ORDEM[mes] || 0) };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-12); // Last 12 months
  }, [faturamento]);

  // Extrair comerciais únicos (códigos)
  const comerciaisDisponiveis = useMemo(() => {
    if (!clientes) return [];
    const codigos = new Set<string>();
    clientes.forEach(c => {
      if (c.responsavel_codigo) {
        codigos.add(c.responsavel_codigo);
      }
    });
    return Array.from(codigos).sort();
  }, [clientes]);

  // Filtrar clientes pelo comercial
  const clientesFiltrados = useMemo(() => {
    if (!clientes) return [];
    if (comercialFilter === "todos") return clientes;
    return clientes.filter(c => c.responsavel_codigo === comercialFilter);
  }, [clientes, comercialFilter]);

  // IDs dos clientes filtrados para filtrar outras entidades
  const clienteIds = useMemo(() => new Set(clientesFiltrados.map(c => c.id)), [clientesFiltrados]);

  // Filtrar oportunidades
  const oportunidadesFiltradas = useMemo(() => {
    if (!oportunidades) return [];
    if (comercialFilter === "todos") return oportunidades;
    return oportunidades.filter(o => clienteIds.has(o.cliente_id));
  }, [oportunidades, comercialFilter, clienteIds]);

  // Filtrar contratos
  const contratosFiltrados = useMemo(() => {
    if (!contratos) return [];
    if (comercialFilter === "todos") return contratos;
    return contratos.filter(c => clienteIds.has(c.cliente_id));
  }, [contratos, comercialFilter, clienteIds]);

  // Filtrar visitas
  const visitasFiltradas = useMemo(() => {
    if (!visitas) return [];
    if (comercialFilter === "todos") return visitas;
    return visitas.filter(v => clienteIds.has(v.cliente_id));
  }, [visitas, comercialFilter, clienteIds]);

  // Filtrar tarefas
  const tarefasFiltradas = useMemo(() => {
    if (!tarefas) return [];
    if (comercialFilter === "todos") return tarefas;
    return tarefas.filter(t => t.cliente_id && clienteIds.has(t.cliente_id));
  }, [tarefas, comercialFilter, clienteIds]);

  // Métricas de Clientes
  const clientesAtivos = clientesFiltrados.filter(c => c.status === "ativo").length;
  const clientesInativos = clientesFiltrados.filter(c => c.status === "inativo").length;

  // Métricas de Oportunidades
  const oportunidadesGanhas = oportunidadesFiltradas.filter(o => o.status === "ganho");
  const totalReceitaFechada = oportunidadesGanhas.reduce((acc, o) => acc + (o.valor || 0), 0);
  const oportunidadesAbertas = oportunidadesFiltradas.filter(o => !["ganho", "perdido"].includes(o.status));
  const totalReceitaPrevista = oportunidadesAbertas.reduce((acc, o) => acc + ((o.valor || 0) * (o.probabilidade || 0) / 100), 0);
  
  // Taxa de conversão
  const totalOportunidades = oportunidadesFiltradas.length;
  const taxaConversao = totalOportunidades > 0 
    ? Math.round((oportunidadesGanhas.length / totalOportunidades) * 100) 
    : 0;

  // Contratos a vencer (próximos 30 dias)
  const hoje = new Date();
  const em30dias = new Date();
  em30dias.setDate(hoje.getDate() + 30);
  const contratosAVencer = contratosFiltrados.filter(c => {
    if (!c.data_fim) return false;
    const dataFim = new Date(c.data_fim);
    return dataFim >= hoje && dataFim <= em30dias && c.status === "ativo";
  }).length;

  // Visitas realizadas (total)
  const visitasRealizadas = visitasFiltradas.filter(v => v.status === "realizada").length;

  // Follow-ups pendentes (tarefas pendentes)
  const followUpsPendentes = tarefasFiltradas.filter(t => 
    t.status === "pendente" || t.status === "em_andamento"
  ).length;

  // Dados para gráfico de pipeline
  const pipelineData = [
    { name: "Qualificação", value: oportunidadesFiltradas.filter(o => o.status === "qualificacao").length },
    { name: "Proposta", value: oportunidadesFiltradas.filter(o => o.status === "proposta").length },
    { name: "Negociação", value: oportunidadesFiltradas.filter(o => o.status === "negociacao").length },
    { name: "Fechamento", value: oportunidadesFiltradas.filter(o => o.status === "fechamento").length },
    { name: "Ganho", value: oportunidadesGanhas.length },
  ].filter(d => d.value > 0);

  // Dados para gráfico de clientes por status
  const clientesStatusData = [
    { name: "Ativos", value: clientesAtivos },
    { name: "Inativos", value: clientesInativos },
    { name: "Prospectos", value: clientesFiltrados.filter(c => c.status === "prospecto").length },
  ].filter(d => d.value > 0);

  // Dados para segmentos
  const segmentosMap = new Map<string, number>();
  clientesFiltrados.forEach(c => {
    if (c.segmentos) {
      c.segmentos.forEach(seg => {
        segmentosMap.set(seg, (segmentosMap.get(seg) || 0) + 1);
      });
    }
  });
  const segmentosData = Array.from(segmentosMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Comercial</h1>
          <p className="text-muted-foreground">Visão geral do CRM Intermarítima</p>
        </div>
        <Select value={comercialFilter} onValueChange={setComercialFilter}>
          <SelectTrigger className="w-[200px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar Comercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Comerciais</SelectItem>
            {comerciaisDisponiveis.map((codigo) => (
              <SelectItem key={codigo} value={codigo}>
                {codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Clientes Ativos"
          value={clientesAtivos.toString()}
          icon={Users}
        />
        <MetricCard
          title="Clientes Inativos"
          value={clientesInativos.toString()}
          icon={UserX}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${taxaConversao}%`}
          icon={Target}
        />
        <MetricCard
          title="Receita Fechada (Mês)"
          value={formatCurrency(totalReceitaFechada)}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Prevista"
          value={formatCurrency(totalReceitaPrevista)}
          icon={TrendingUp}
        />
        <MetricCard
          title="Contratos a Vencer"
          value={contratosAVencer.toString()}
          icon={FileCheck}
        />
        <MetricCard
          title="Visitas Realizadas"
          value={visitasRealizadas.toString()}
          icon={ClipboardList}
        />
        <MetricCard
          title="Follow-ups Pendentes"
          value={followUpsPendentes.toString()}
          icon={PhoneCall}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma oportunidade cadastrada
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {clientesStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientesStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientesStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum cliente cadastrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5" />
            Top 10 Segmentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {segmentosData.length > 0 ? (
            <div className="space-y-3">
              {segmentosData.map((seg, index) => (
                <div key={seg.name} className="flex items-center gap-3">
                  <div className="w-8 text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{seg.name}</span>
                      <span className="text-sm text-muted-foreground">{seg.value} clientes</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${(seg.value / (segmentosData[0]?.value || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faturamento Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Faturamento Realizado — {formatCurrency(faturamentoTotal)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {faturamentoPorMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={faturamentoPorMes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="valor" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado de faturamento importado. Acesse a página Faturamento para importar planilhas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
