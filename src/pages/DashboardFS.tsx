import { useClientes } from "@/hooks/useClientes";
import { useVisitas } from "@/hooks/useVisitas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Users, TrendingUp, TrendingDown, Activity, Target, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardFS() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: visitas, isLoading: loadingVisitas } = useVisitas();

  if (loadingClientes || loadingVisitas) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const clientesFS = clientes?.filter(
    (c) => c.responsavel_codigo === "FS" || c.is_cliente_fs === true
  ) || [];

  const totalClientesFS = clientesFS.length;
  const ativosFS = clientesFS.filter((c) => c.status === "ativo").length;
  const inativosFS = clientesFS.filter((c) => c.status === "inativo").length;
  const ativosComVolume = clientesFS.filter(
    (c) => c.status === "ativo" && (c.volume_12_meses || 0) > 0
  ).length;
  const ativosSemVolume = clientesFS.filter(
    (c) => c.status === "ativo" && (c.volume_12_meses || 0) === 0
  ).length;
  const inativosComHistorico = clientesFS.filter(
    (c) => c.status === "inativo" && (c.volume_12_meses || 0) > 0
  ).length;

  // Top 10 clientes por volume
  const top10Clientes = [...clientesFS]
    .sort((a, b) => (b.volume_12_meses || 0) - (a.volume_12_meses || 0))
    .slice(0, 10)
    .map((c) => ({
      nome: c.empresa.length > 20 ? c.empresa.substring(0, 20) + "..." : c.empresa,
      volume: c.volume_12_meses || 0,
    }));

  // Visitas no mês atual
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  
  const visitasFS = visitas?.filter((v) => {
    const cliente = clientesFS.find((c) => c.id === v.cliente_id);
    const dataVisita = new Date(v.data_visita);
    return cliente && dataVisita.getMonth() === mesAtual && dataVisita.getFullYear() === anoAtual;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visão FS</h1>
        <p className="text-muted-foreground">
          Dashboard executivo da carteira FS
        </p>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clientes FS"
          value={totalClientesFS}
          icon={Users}
        />
        <MetricCard
          title="Clientes Ativos"
          value={ativosFS}
          icon={TrendingUp}
        />
        <MetricCard
          title="Clientes Inativos"
          value={inativosFS}
          icon={TrendingDown}
        />
        <MetricCard
          title="Ativos com Volume"
          value={ativosComVolume}
          icon={Activity}
        />
        <MetricCard
          title="Ativos sem Volume"
          value={ativosSemVolume}
          icon={Target}
        />
        <MetricCard
          title="Visitas no Mês"
          value={visitasFS.length}
          icon={Calendar}
        />
      </div>

      {/* Novas Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Clientes por Terminal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["EMPÓRIO", "TPC", "INTER", "TECON"].map((terminal) => {
              const count = clientesFS.filter(
                (c) => c.terminais_operados?.includes(terminal)
              ).length;
              return (
                <div key={terminal} className="flex justify-between">
                  <span className="text-sm">{terminal}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Clientes por Tipo de Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Importação", "Exportação", "Logística Integrada", "Transporte"].map((servico) => {
              const count = clientesFS.filter(
                (c) => c.tipos_servico?.includes(servico)
              ).length;
              return (
                <div key={servico} className="flex justify-between">
                  <span className="text-sm">{servico}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Análise Especial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Freight Forwarders</span>
              <span className="font-semibold">
                {clientesFS.filter((c) => c.is_freight_forwarder).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Opera Concorrentes</span>
              <span className="font-semibold">
                {clientesFS.filter(
                  (c) =>
                    c.terminais_operados?.length > 0 &&
                    !c.terminais_operados.includes("INTER")
                ).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Multisserviço</span>
              <span className="font-semibold">
                {clientesFS.filter((c) => (c.tipos_servico?.length || 0) > 2).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Oportunidades de Retomada */}
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades de Retomada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Inativos com Histórico</h3>
                <p className="text-sm text-muted-foreground">
                  Clientes que já movimentaram e pararam
                </p>
              </div>
              <div className="text-3xl font-bold">{inativosComHistorico}</div>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Ativos sem Movimento</h3>
                <p className="text-sm text-muted-foreground">
                  Risco de churn - ação necessária
                </p>
              </div>
              <div className="text-3xl font-bold">{ativosSemVolume}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Clientes por Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes por Volume (12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={top10Clientes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR').format(value as number)} />
              <Bar dataKey="volume" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["industrial", "comercial", "varejo", "tecnologia", "outros"].map((seg) => {
              const count = clientesFS.filter((c) => c.segmento === seg).length;
              const percentage = totalClientesFS > 0 ? (count / totalClientesFS) * 100 : 0;
              return (
                <div key={seg} className="flex items-center justify-between">
                  <span className="capitalize">{seg}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
