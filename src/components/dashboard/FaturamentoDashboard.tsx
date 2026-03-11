import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./MetricCard";
import {
  DollarSign,
  Percent,
  Users,
  Receipt,
  FilterX,
  TrendingUp,
  Building2,
  BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useFaturamento } from "@/hooks/useFaturamento";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const MESES_ORDEM: Record<string, number> = {
  Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
  Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyShort = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return formatCurrency(value);
};

export function FaturamentoDashboard() {
  const { data: faturamento, isLoading } = useFaturamento();

  const [anoFilter, setAnoFilter] = useState("todos");
  const [mesFilter, setMesFilter] = useState("todos");
  const [gcFilter, setGcFilter] = useState("todos");
  const [clienteFilter, setClienteFilter] = useState("todos");
  const [segmentoFilter, setSegmentoFilter] = useState("todos");
  const [unidadeFilter, setUnidadeFilter] = useState("todos");
  const [setorFilter, setSetorFilter] = useState("todos");

  const hasActiveFilter = anoFilter !== "todos" || mesFilter !== "todos" || gcFilter !== "todos" ||
    segmentoFilter !== "todos" || unidadeFilter !== "todos" || setorFilter !== "todos";

  const clearFilters = () => {
    setAnoFilter("todos");
    setMesFilter("todos");
    setGcFilter("todos");
    setSegmentoFilter("todos");
    setUnidadeFilter("todos");
    setSetorFilter("todos");
  };

  // Filter options from raw data
  const filterOptions = useMemo(() => {
    if (!faturamento) return { anos: [], meses: [], gcs: [], segmentos: [], unidades: [], setores: [] };
    return {
      anos: [...new Set(faturamento.map(f => f.ano))].sort((a, b) => b - a),
      meses: Object.keys(MESES_ORDEM),
      gcs: [...new Set(faturamento.map(f => f.gc).filter(Boolean))].sort() as string[],
      segmentos: [...new Set(faturamento.map(f => f.segmento).filter(Boolean))].sort() as string[],
      unidades: [...new Set(faturamento.map(f => f.unidade).filter(Boolean))].sort() as string[],
      setores: [...new Set(faturamento.map(f => f.setor).filter(Boolean))].sort() as string[],
    };
  }, [faturamento]);

  // Filtered data
  const filtrado = useMemo(() => {
    if (!faturamento) return [];
    return faturamento.filter(f => {
      if (anoFilter !== "todos" && f.ano !== Number(anoFilter)) return false;
      if (mesFilter !== "todos" && f.mes !== mesFilter) return false;
      if (gcFilter !== "todos" && f.gc !== gcFilter) return false;
      if (segmentoFilter !== "todos" && f.segmento !== segmentoFilter) return false;
      if (unidadeFilter !== "todos" && f.unidade !== unidadeFilter) return false;
      if (setorFilter !== "todos" && f.setor !== setorFilter) return false;
      return true;
    });
  }, [faturamento, anoFilter, mesFilter, gcFilter, segmentoFilter, unidadeFilter, setorFilter]);

  // KPIs
  const faturamentoTotal = useMemo(() => filtrado.reduce((a, f) => a + Number(f.valor), 0), [filtrado]);
  const comissaoTotal = faturamentoTotal * 0.003;
  const clientesUnicos = useMemo(() => new Set(filtrado.map(f => f.cliente_para)).size, [filtrado]);
  const ticketMedio = clientesUnicos > 0 ? faturamentoTotal / clientesUnicos : 0;

  // Chart: Faturamento + Comissão mensal
  const faturamentoPorMes = useMemo(() => {
    const map = new Map<string, number>();
    filtrado.forEach(f => {
      const key = `${f.mes}/${f.ano}`;
      map.set(key, (map.get(key) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([key, valor]) => {
        const [mes, ano] = key.split("/");
        return { name: key, valor, comissao: valor * 0.003, sortKey: Number(ano) * 100 + (MESES_ORDEM[mes] || 0) };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-12);
  }, [filtrado]);

  // Chart: Top 10 Segmentos
  const topSegmentos = useMemo(() => {
    const map = new Map<string, number>();
    filtrado.forEach(f => {
      const seg = f.segmento || "Outros";
      map.set(seg, (map.get(seg) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, comissao: value * 0.003 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtrado]);

  // Chart: Top 10 GCs
  const topGCs = useMemo(() => {
    const map = new Map<string, number>();
    filtrado.forEach(f => {
      const gc = f.gc || "Sem GC";
      map.set(gc, (map.get(gc) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, comissao: value * 0.003 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtrado]);

  // Chart: Faturamento por Unidade
  const faturamentoPorUnidade = useMemo(() => {
    const map = new Map<string, number>();
    filtrado.forEach(f => {
      const u = f.unidade || "Outros";
      map.set(u, (map.get(u) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtrado]);

  // Top 10 clientes ranking
  const topClientes = useMemo(() => {
    const map = new Map<string, number>();
    filtrado.forEach(f => {
      map.set(f.cliente_para, (map.get(f.cliente_para) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, comissao: value * 0.003 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtrado]);

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando faturamento...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Faturamento & Comissão</h2>
          </div>
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <FilterX className="h-4 w-4 mr-1" /> Limpar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Select value={anoFilter} onValueChange={setAnoFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Anos</SelectItem>
              {filterOptions.anos.map(a => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mesFilter} onValueChange={setMesFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Meses</SelectItem>
              {filterOptions.meses.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={gcFilter} onValueChange={setGcFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="GC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os GCs</SelectItem>
              {filterOptions.gcs.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={segmentoFilter} onValueChange={setSegmentoFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Segmentos</SelectItem>
              {filterOptions.segmentos.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Unidades</SelectItem>
              {filterOptions.unidades.map(u => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={setorFilter} onValueChange={setSetorFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Setores</SelectItem>
              {filterOptions.setores.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Faturamento Total" value={formatCurrency(faturamentoTotal)} icon={DollarSign} />
        <MetricCard title="Comissão (0,3%)" value={formatCurrency(comissaoTotal)} icon={Percent} />
        <MetricCard title="Clientes Únicos" value={clientesUnicos.toString()} icon={Users} />
        <MetricCard title="Ticket Médio" value={formatCurrency(ticketMedio)} icon={Receipt} />
      </div>

      {/* Charts row 1: Mensal + Unidade */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5" />
              Faturamento & Comissão Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faturamentoPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faturamentoPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs" tickFormatter={(v) => formatCurrencyShort(v)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="valor" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Faturamento" />
                  <Bar dataKey="comissao" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Comissão" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado de faturamento disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5" />
              Faturamento por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faturamentoPorUnidade.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={faturamentoPorUnidade}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {faturamentoPorUnidade.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: Segmento + GC (horizontal bars) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Segmentos</CardTitle>
          </CardHeader>
          <CardContent>
            {topSegmentos.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topSegmentos} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={75} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} name="Faturamento" />
                  <Bar dataKey="comissao" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Comissão" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance por GC</CardTitle>
          </CardHeader>
          <CardContent>
            {topGCs.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topGCs} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={75} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} name="Faturamento" />
                  <Bar dataKey="comissao" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} name="Comissão" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Clientes Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Clientes por Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          {topClientes.length > 0 ? (
            <div className="space-y-3">
              {topClientes.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-8 text-sm font-bold text-muted-foreground">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <div className="flex gap-4 text-xs text-muted-foreground shrink-0">
                        <span>Fat: {formatCurrency(c.value)}</span>
                        <span>Com: {formatCurrency(c.comissao)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(c.value / (topClientes[0]?.value || 1)) * 100}%` }}
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
