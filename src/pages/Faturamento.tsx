import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, DollarSign, TrendingUp, Building2, BarChart3, FilterX, Layers, ChevronLeft, ChevronRight, Database, Calendar, Users } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { useFaturamento, useImportFaturamento, useDeleteFaturamentoByPeriod, FaturamentoInsert } from "@/hooks/useFaturamento";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#8884d8', '#82ca9d', '#ffc658'];

const MESES_ORDEM: Record<string, number> = {
  Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
  Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const PAGE_SIZE = 50;

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
  const [page, setPage] = useState(1);

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
    setPage(1);
  };

  // Filter options from raw data — NO limit on clientes
  const filterOptions = useMemo(() => {
    if (!faturamento) return { anos: [], meses: [], gcs: [], clientes: [], segmentos: [], unidades: [], setores: [] };
    return {
      anos: [...new Set(faturamento.map(f => f.ano))].sort((a, b) => b - a),
      meses: Object.keys(MESES_ORDEM),
      gcs: [...new Set(faturamento.map(f => f.gc).filter(Boolean))].sort() as string[],
      clientes: [...new Set(faturamento.map(f => f.cliente_para).filter(Boolean))].sort() as string[],
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(dadosFiltrados.length / PAGE_SIZE));
  const paginatedData = useMemo(() => dadosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [dadosFiltrados, page]);

  // KPIs
  const totalFaturamento = useMemo(() => dadosFiltrados.reduce((acc, f) => acc + Number(f.valor), 0), [dadosFiltrados]);
  const totalComissao = useMemo(() => totalFaturamento * 0.003, [totalFaturamento]);
  const totalRegistros = dadosFiltrados.length;
  const clientesUnicos = useMemo(() => new Set(dadosFiltrados.map(f => f.cliente_para)).size, [dadosFiltrados]);
  const setoresUnicos = useMemo(() => new Set(dadosFiltrados.map(f => f.setor).filter(Boolean)).size, [dadosFiltrados]);
  const ticketMedio = useMemo(() => clientesUnicos > 0 ? totalFaturamento / clientesUnicos : 0, [totalFaturamento, clientesUnicos]);

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

  // Chart: by GC
  const receitaPorGc = useMemo(() => {
    const map = new Map<string, number>();
    dadosFiltrados.forEach(f => {
      const gc = f.gc || "Sem GC";
      map.set(gc, (map.get(gc) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [dadosFiltrados]);

  // Chart: by Unidade
  const receitaPorUnidade = useMemo(() => {
    const map = new Map<string, number>();
    dadosFiltrados.forEach(f => {
      const u = f.unidade || "Outros";
      map.set(u, (map.get(u) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dadosFiltrados]);

  // Chart: by Setor
  const receitaPorSetor = useMemo(() => {
    const map = new Map<string, number>();
    dadosFiltrados.forEach(f => {
      const s = f.setor || "Outros";
      map.set(s, (map.get(s) || 0) + Number(f.valor));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [dadosFiltrados]);

  // Acumulado Mensal
  const acumuladoMensal = useMemo(() => {
    const map = new Map<string, { valor: number; sortKey: number }>();
    dadosFiltrados.forEach(f => {
      const key = `${f.mes}/${f.ano}`;
      const prev = map.get(key) || { valor: 0, sortKey: 0 };
      map.set(key, {
        valor: prev.valor + Number(f.valor),
        sortKey: Number(f.ano) * 100 + (MESES_ORDEM[f.mes] || 0),
      });
    });
    const sorted = Array.from(map.entries())
      .map(([name, { valor, sortKey }]) => ({ name, valor, sortKey, acumulado: 0 }))
      .sort((a, b) => a.sortKey - b.sortKey);
    let acc = 0;
    sorted.forEach(item => { acc += item.valor; item.acumulado = acc; });
    return sorted;
  }, [dadosFiltrados]);

  // Acumulado Anual
  const acumuladoAnual = useMemo(() => {
    const map = new Map<number, number>();
    dadosFiltrados.forEach(f => {
      map.set(f.ano, (map.get(f.ano) || 0) + Number(f.valor));
    });
    const sorted = Array.from(map.entries())
      .map(([ano, valor]) => ({ name: String(ano), valor, acumulado: 0 }))
      .sort((a, b) => Number(a.name) - Number(b.name));
    let acc = 0;
    sorted.forEach(item => { acc += item.valor; item.acumulado = acc; });
    return sorted;
  }, [dadosFiltrados]);

  // Top 15 Clientes with segment
  const topClientes = useMemo(() => {
    const map = new Map<string, { value: number; segmento: string }>();
    dadosFiltrados.forEach(f => {
      if (f.cliente_para) {
        const prev = map.get(f.cliente_para) || { value: 0, segmento: "" };
        map.set(f.cliente_para, {
          value: prev.value + Number(f.valor),
          segmento: f.segmento || prev.segmento || "",
        });
      }
    });
    return Array.from(map.entries())
      .map(([name, { value, segmento }]) => ({ name, value, comissao: value * 0.003, segmento }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
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
        // Added "cliente" as fallback for single-column spreadsheets
        const clientePara = String(findValue(row, normalizedRow, "cliente - para", "cliente para", "cliente_para", "cliente") || "");
        const gc = findValue(row, normalizedRow, "gc") ?? null;
        const segmento = findValue(row, normalizedRow, "segmento") ?? null;
        const unidade = findValue(row, normalizedRow, "unidade") ?? null;
        const setor = findValue(row, normalizedRow, "setor") ?? null;

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

    e.target.value = "";
  }, [importMutation]);

  const handleExport = useCallback((format: "xlsx" | "csv") => {
    if (!dadosFiltrados || dadosFiltrados.length === 0) {
      toast.error("Nenhum dado para exportar.");
      return;
    }
    const exportData = dadosFiltrados.map(f => ({
      Mês: f.mes,
      Ano: f.ano,
      Cliente: f.cliente_para,
      "Cliente De": f.cliente_de || "",
      GC: f.gc || "",
      Segmento: f.segmento || "",
      Valor: f.valor,
      Unidade: f.unidade || "",
      Setor: f.setor || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faturamento");
    const suffix = hasActiveFilter ? "_filtrado" : "_completo";
    if (format === "xlsx") {
      XLSX.writeFile(wb, `faturamento${suffix}.xlsx`);
    } else {
      XLSX.writeFile(wb, `faturamento${suffix}.csv`, { bookType: "csv" });
    }
    toast.success(`${dadosFiltrados.length} registros exportados!`);
  }, [dadosFiltrados, hasActiveFilter]);

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
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("xlsx")}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <Upload className="h-4 w-4" />
              Importar Planilha
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} disabled={importMutation.isPending} />
            </label>
          </Button>
        </div>
      </div>

      {/* Base Importada Info */}
      {faturamento && faturamento.length > 0 && (() => {
        const lastImportDate = new Date(Math.max(...faturamento.map(f => new Date(f.created_at).getTime())));
        const anos = faturamento.map(f => f.ano);
        const minAno = Math.min(...anos);
        const maxAno = Math.max(...anos);
        const gcsUnicos = new Set(faturamento.map(f => f.gc).filter(Boolean)).size;
        const mesesUnicos = new Set(faturamento.map(f => `${f.mes}/${f.ano}`)).size;
        return (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{faturamento.length.toLocaleString("pt-BR")} registros</div>
                    <div className="text-xs text-muted-foreground">Total na base</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{lastImportDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="text-xs text-muted-foreground">Última importação</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{minAno === maxAno ? String(minAno) : `${minAno} – ${maxAno}`} ({mesesUnicos} meses)</div>
                    <div className="text-xs text-muted-foreground">Período coberto</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{gcsUnicos} GC{gcsUnicos !== 1 ? "s" : ""}</div>
                    <div className="text-xs text-muted-foreground">Gestores Comerciais</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Filters */}
      <div className="space-y-3">
        {hasActiveFilter && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <FilterX className="h-4 w-4 mr-1" /> Limpar Filtros
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <Select value={filtroAno} onValueChange={setFiltroAno}>
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

          <Select value={filtroMes} onValueChange={setFiltroMes}>
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

          <Select value={filtroGc} onValueChange={setFiltroGc}>
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

          <Select value={filtroCliente} onValueChange={setFiltroCliente}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="todos">Todos os Clientes</SelectItem>
              {filterOptions.clientes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
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

          <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
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

          <Select value={filtroSetor} onValueChange={setFiltroSetor}>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold truncate">{formatCurrency(totalFaturamento)}</div>
                <div className="text-xs text-muted-foreground">Faturamento Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-chart-2 shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold truncate">{formatCurrency(totalComissao)}</div>
                <div className="text-xs text-muted-foreground">Comissão (0,3%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-7 w-7 text-chart-3 shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold truncate">{formatCurrency(ticketMedio)}</div>
                <div className="text-xs text-muted-foreground">Ticket Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold">{totalRegistros.toLocaleString("pt-BR")}</div>
                <div className="text-xs text-muted-foreground">Registros</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold">{clientesUnicos}</div>
                <div className="text-xs text-muted-foreground">Clientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Layers className="h-7 w-7 text-chart-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xl font-bold">{setoresUnicos}</div>
                <div className="text-xs text-muted-foreground">Setores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 1: Mensal + Segmento */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento Mensal</CardTitle>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorSegmento.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={receitaPorSegmento} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} dataKey="value">
                    {receitaPorSegmento.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2: GC + Setor */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance por GC</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorGc.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={receitaPorGc} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} dataKey="value">
                    {receitaPorGc.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorSetor.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaPorSetor} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={75} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Faturamento" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 3: Unidade (pie) + Acumulado Mensal */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento por Unidade</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaPorUnidade.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={receitaPorUnidade} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} dataKey="value">
                    {receitaPorUnidade.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento Acumulado Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {acumuladoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={acumuladoMensal}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="valor" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Mensal" opacity={0.6} />
                  <Area type="monotone" dataKey="acumulado" fill="hsl(var(--primary))" stroke="hsl(var(--primary))" fillOpacity={0.15} name="Acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 4: Acumulado Anual */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento Acumulado Anual</CardTitle>
          </CardHeader>
          <CardContent>
            {acumuladoAnual.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={acumuladoAnual}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="valor" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Anual" opacity={0.6} />
                  <Area type="monotone" dataKey="acumulado" fill="hsl(var(--chart-4))" stroke="hsl(var(--chart-4))" fillOpacity={0.15} name="Acumulado" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado disponível</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 15 Clientes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 15 Clientes por Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          {topClientes.length > 0 ? (
            <div className="space-y-3">
              {topClientes.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-8 text-sm font-bold text-muted-foreground">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{c.name}</span>
                        {c.segmento && <Badge variant="outline" className="text-[10px] shrink-0">{c.segmento}</Badge>}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground shrink-0">
                        <span>Fat: {formatCurrency(c.value)}</span>
                        <span>Com: {formatCurrency(c.comissao)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / (topClientes[0]?.value || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">Nenhum dado disponível</div>
          )}
        </CardContent>
      </Card>

      {/* Table with pagination */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Dados Importados ({dadosFiltrados.length.toLocaleString("pt-BR")} registros)</CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {dadosFiltrados.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>GC</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Comissão (0,3%)</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Setor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.mes}</TableCell>
                      <TableCell>{f.ano}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{f.cliente_para}</TableCell>
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
