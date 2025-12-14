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
  PackageSearch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useContratos } from "@/hooks/useContratos";
import { useVisitas } from "@/hooks/useVisitas";
import { useTarefas } from "@/hooks/useTarefas";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: oportunidades, isLoading: loadingOportunidades } = useOportunidades();
  const { data: contratos, isLoading: loadingContratos } = useContratos();
  const { data: visitas, isLoading: loadingVisitas } = useVisitas();
  const { data: tarefas, isLoading: loadingTarefas } = useTarefas();

  const isLoading = loadingClientes || loadingOportunidades || loadingContratos || loadingVisitas || loadingTarefas;

  // Métricas de Clientes
  const clientesAtivos = clientes?.filter(c => c.status === "ativo").length || 0;
  const clientesInativos = clientes?.filter(c => c.status === "inativo").length || 0;

  // Métricas de Oportunidades
  const oportunidadesGanhas = oportunidades?.filter(o => o.status === "ganho") || [];
  const totalReceitaFechada = oportunidadesGanhas.reduce((acc, o) => acc + (o.valor || 0), 0);
  const oportunidadesAbertas = oportunidades?.filter(o => !["ganho", "perdido"].includes(o.status)) || [];
  const totalReceitaPrevista = oportunidadesAbertas.reduce((acc, o) => acc + ((o.valor || 0) * (o.probabilidade || 0) / 100), 0);
  
  // Taxa de conversão
  const totalOportunidades = oportunidades?.length || 0;
  const taxaConversao = totalOportunidades > 0 
    ? Math.round((oportunidadesGanhas.length / totalOportunidades) * 100) 
    : 0;

  // Contratos a vencer (próximos 30 dias)
  const hoje = new Date();
  const em30dias = new Date();
  em30dias.setDate(hoje.getDate() + 30);
  const contratosAVencer = contratos?.filter(c => {
    if (!c.data_fim) return false;
    const dataFim = new Date(c.data_fim);
    return dataFim >= hoje && dataFim <= em30dias && c.status === "ativo";
  }).length || 0;

  // Visitas realizadas (este mês)
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const visitasRealizadas = visitas?.filter(v => {
    const dataVisita = new Date(v.data_visita);
    return dataVisita.getMonth() === mesAtual && 
           dataVisita.getFullYear() === anoAtual && 
           v.status === "realizada";
  }).length || 0;

  // Follow-ups pendentes (tarefas pendentes)
  const followUpsPendentes = tarefas?.filter(t => 
    t.status === "pendente" || t.status === "em_andamento"
  ).length || 0;

  // Dados para gráfico de pipeline
  const pipelineData = [
    { name: "Qualificação", value: oportunidades?.filter(o => o.status === "qualificacao").length || 0 },
    { name: "Proposta", value: oportunidades?.filter(o => o.status === "proposta").length || 0 },
    { name: "Negociação", value: oportunidades?.filter(o => o.status === "negociacao").length || 0 },
    { name: "Fechamento", value: oportunidades?.filter(o => o.status === "fechamento").length || 0 },
    { name: "Ganho", value: oportunidadesGanhas.length },
  ].filter(d => d.value > 0);

  // Dados para gráfico de clientes por status
  const clientesStatusData = [
    { name: "Ativos", value: clientesAtivos },
    { name: "Inativos", value: clientesInativos },
    { name: "Prospectos", value: clientes?.filter(c => c.status === "prospecto").length || 0 },
  ].filter(d => d.value > 0);

  // Dados para segmentos
  const segmentosMap = new Map<string, number>();
  clientes?.forEach(c => {
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Comercial</h1>
        <p className="text-muted-foreground">Visão geral do CRM Intermarítima</p>
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
    </div>
  );
}