import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileDown, Trash2, DollarSign, TrendingUp, Building2, BarChart3, FilterX } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useFaturamento, useImportFaturamento, useDeleteFaturamentoByPeriod, FaturamentoInsert } from "@/hooks/useFaturamento";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const MESES_ORDEM: Record<string, number> = {
  Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
  Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default function Faturamento() {
  const { data: faturamento, isLoading } = useFaturamento();
  const importMutation = useImportFaturamento();
  const deleteMutation = useDeleteFaturamentoByPeriod();

  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroGc, setFiltroGc] = useState<string>("todos");
  const [filtroCliente, setFiltroCliente] = useState<string>("todos");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");
  const [filtroUnidade, setFiltroUnidade] = useState<string>("todos");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");

  const hasActiveFilter = filtroAno !== "todos" || filtroMes !== "todos" || filtroGc !== "todos" ||
    filtroCliente !== "todos" || filtroSegmento !== "todos" || filtroUnidade !== "todos" || filtroSetor !== "todos";

  const clearFilters = () => {
    setFiltroAno("todos");
    setFiltroMes("todos");
    setFiltroGc("todos");
    setFiltroCliente("todos");
    setFiltroSegmento("todos");
    setFiltroUnidade("todos");
    setFiltroSetor("todos");
  };

  // Filter options from raw data
  const filterOptions = useMemo(() => {
    if (!faturamento) return { anos: [], meses: [], gcs: [], clientes: [], segmentos: [], unidades: [], setores: [] };
    return {
      anos: [...new Set(faturamento.map(f => f.ano))].sort((a, b) => b - a),
      meses: Object.keys(MESES_ORDEM),
      gcs: [...new Set(faturamento.map(f => f.gc).filter(Boolean))].sort() as string[],
      clientes: [...new Set(faturamento.map(f => f.cliente_para).filter(Boolean))].sort().slice(0, 100) as string[],
      segmentos: [...new Set(faturamento.map(f => f.segmento).filter(Boolean))].sort() as string[],
      unidades: [...new Set(faturamento.map(f => f.unidade).filter(Boolean))].sort() as string[],
      setores: [...new Set(faturamento.map(f => f.setor).filter(Boolean))].sort() as string[],
    };
  }, [faturamento]);

  // Filtered data
  const dadosFiltrados = useMemo(() => {
    if (!faturamento) return [];
    return faturamento.filter(f => {
      if (filtroAno !== "todos" && f.ano !== Number(filtroAno)) return false;
      if (filtroMes !== "todos" && f.mes !== filtroMes) return false;
      if (filtroGc !== "todos" && f.gc !== filtroGc) return false;
      if (filtroCliente !== "todos" && f.cliente_para !== filtroCliente) return false;
      if (filtroSegmento !== "todos" && f.segmento !== filtroSegmento) return false;
      if (filtroUnidade !== "todos" && f.unidade !== filtroUnidade) return false;
      if (filtroSetor !== "todos" && f.setor !== filtroSetor) return false;
      return true;
    });
  }, [faturamento, filtroAno, filtroMes, filtroGc, filtroCliente, filtroSegmento, filtroUnidade, filtroSetor]);

  // KPIs
  const totalFaturamento = useMemo(() => dadosFiltrados.reduce((acc, f) => acc + Number(f.valor), 0), [dadosFiltrados]);
  const totalComissao = useMemo(() => totalFaturamento * 0.003, [totalFaturamento]);
  const totalRegistros = dadosFiltrados.length;
  const clientesUnicos = useMemo(() => new Set(dadosFiltrados.map(f => f.cliente_para)).size, [dadosFiltrados]);
  const segmentosUnicos = useMemo(() => new Set(dadosFiltrados.map(f => f.segmento).filter(Boolean)).size, [dadosFiltrados]);

  // Chart: revenue by month
  const receitaPorMes = useMemo(() => {
    const map = new Map<string, number>();
    dadosFiltrados.forEach(f => {
      const key = `${f.mes}/${f.ano}`;
      map.set(key, (map.get(key) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([key, valor]) => {
        const [mes, ano] = key.split("/");
        return { name: key, valor, sortKey: Number(ano) * 100 + (MESES_ORDEM[mes] || 0) };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [dadosFiltrados]);

  // Chart: by segment
  const receitaPorSegmento = useMemo(() => {
    const map = new Map<string, number>();
    dadosFiltrados.forEach(f => {
      const seg = f.segmento || "Outros";
      map.set(seg, (map.get(seg) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dadosFiltrados]);

  // Import handler
  const normalizeKey = (s: string) =>
    s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const findValue = (row: Record<string, any>, normalizedRow: Record<string, any>, ...keys: string[]) => {
    for (const key of keys) {
      if (normalizedRow[key] !== undefined) return normalizedRow[key];
    }
    return undefined;
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      if (jsonData.length === 0) {
        toast.error("Planilha vazia!");
        return;
      }

      // Debug: log detected headers
      if (jsonData.length > 0) {
        console.log("Headers detectados na planilha:", Object.keys(jsonData[0]));
      }

      const rows: FaturamentoInsert[] = jsonData.map(row => {
        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
        );

        const mes = String(findValue(row, normalizedRow, "mes", "mês") || "");
        const ano = Number(findValue(row, normalizedRow, "ano") || 0);
        const clienteDe = String(findValue(row, normalizedRow, "cliente - de", "cliente de", "cliente_de") || "");
        const clientePara = String(findValue(row, normalizedRow, "cliente - para", "cliente para", "cliente_para") || "");
        const gc = findValue(row, normalizedRow, "gc") ?? null;
        const segmento = findValue(row, normalizedRow, "segmento") ?? null;
        const unidade = findValue(row, normalizedRow, "unidade") ?? null;
        const setor = findValue(row, normalizedRow, "setor") ?? null;

        // Parse valor - handle R$ format
        let valorRaw = findValue(row, normalizedRow, "valor") ?? 0;
        let valor = 0;
        if (typeof valorRaw === "string") {
          valor = Number(valorRaw.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
        } else {
          valor = Number(valorRaw) || 0;
        }

        return { mes, ano, cliente_de: clienteDe, cliente_para: clientePara, gc, segmento, valor, unidade, setor };
      });

      const validRows = rows.filter(r => r.mes && r.ano);
      if (validRows.length === 0) {
        toast.error("Nenhum registro válido encontrado. Verifique os cabeçalhos da planilha.");
        console.log("Exemplo de row normalizada:", jsonData[0] ? Object.keys(jsonData[0]) : "vazio");
        return;
      }

      await importMutation.mutateAsync(validRows);
    } catch (err: any) {
      toast.error("Erro ao processar arquivo: " + err.message);
    }

    // Reset input
    e.target.value = "";
  }, [importMutation]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
          <p className="text-muted-foreground">Importação e análise de faturamento mensal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <Upload className="h-4 w-4" />
              Importar Planilha
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} disabled={importMutation.isPending} />
            </label>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filtroAno} onValueChange={setFiltroAno}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Anos</SelectItem>
            {anos.map(a => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Segmentos</SelectItem>
            {segmentos.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalFaturamento)}</div>
                <div className="text-sm text-muted-foreground">Faturamento Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-chart-2" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(totalComissao)}</div>
                <div className="text-sm text-muted-foreground">Comissão (0,3%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalRegistros}</div>
                <div className="text-sm text-muted-foreground">Registros</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{clientesUnicos}</div>
                <div className="text-sm text-muted-foreground">Clientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{segmentosUnicos}</div>
                <div className="text-sm text-muted-foreground">Segmentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível. Importe uma planilha.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorSegmento.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={receitaPorSegmento}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {receitaPorSegmento.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Importados ({dadosFiltrados.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          {dadosFiltrados.length > 0 ? (
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Cliente - De</TableHead>
                    <TableHead>Cliente - Para</TableHead>
                    <TableHead>GC</TableHead>
                    <TableHead>Segmento</TableHead>
                     <TableHead className="text-right">Valor</TableHead>
                     <TableHead className="text-right">Comissão (0,3%)</TableHead>
                     <TableHead>Unidade</TableHead>
                     <TableHead>Setor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosFiltrados.slice(0, 100).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.mes}</TableCell>
                      <TableCell>{f.ano}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{f.cliente_de}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{f.cliente_para}</TableCell>
                      <TableCell>{f.gc}</TableCell>
                      <TableCell>
                        {f.segmento && <Badge variant="outline">{f.segmento}</Badge>}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(Number(f.valor))}</TableCell>
                       <TableCell className="text-right text-muted-foreground">{formatCurrency(Number(f.valor) * 0.003)}</TableCell>
                       <TableCell>{f.unidade}</TableCell>
                      <TableCell>{f.setor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {dadosFiltrados.length > 100 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Exibindo 100 de {dadosFiltrados.length} registros
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Nenhum dado importado. Use o botão "Importar Planilha" para carregar dados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
