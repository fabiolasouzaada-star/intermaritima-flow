import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Plus, AlertCircle, Clock, CheckCircle2, LayoutGrid, List, User, Search, Filter, Users, XCircle, Loader2, Archive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTarefas, useUpdateTarefa, type Tarefa } from "@/hooks/useTarefas";
import { useClientes } from "@/hooks/useClientes";
import { TarefaForm } from "@/components/forms/TarefaForm";
import { KanbanBoard } from "@/components/tarefas/KanbanBoard";
import { TarefaDetailDialog } from "@/components/tarefas/TarefaDetailDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Tarefas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [selectedTarefa, setSelectedTarefa] = useState<Tarefa | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPrazo, setFiltroPrazo] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");
  const [filtroCliente, setFiltroCliente] = useState<string>("todos");
  const [comercialFilter, setComercialFilter] = useState<string>("todos");
  
  const { data: tarefas, isLoading } = useTarefas();
  const { data: clientes } = useClientes();
  const updateTarefa = useUpdateTarefa();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const comerciaisDisponiveis = useMemo(() => {
    if (!clientes) return [];
    const codigos = new Set<string>();
    clientes.forEach(c => {
      if (c.responsavel_codigo) codigos.add(c.responsavel_codigo);
    });
    return Array.from(codigos).sort();
  }, [clientes]);

  const clienteToComercial = useMemo(() => {
    const map = new Map<string, string>();
    clientes?.forEach(c => {
      if (c.responsavel_codigo) map.set(c.id, c.responsavel_codigo);
    });
    return map;
  }, [clientes]);

  const clientesUnicos = useMemo(() => {
    return tarefas
      ?.filter(t => t.clientes?.empresa)
      .map(t => t.clientes!.empresa)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort() || [];
  }, [tarefas]);

  // Dashboard stats (sempre sobre TODAS as tarefas, sem filtro de arquivamento)
  const dashboardStats = useMemo(() => {
    if (!tarefas) return { pendentes: 0, emAndamento: 0, concluidas: 0, canceladas: 0, atrasadas: 0, total: 0, percentConcluidas: 0 };
    const pendentes = tarefas.filter(t => t.status === "pendente").length;
    const emAndamento = tarefas.filter(t => t.status === "em_andamento").length;
    const concluidas = tarefas.filter(t => t.status === "concluida").length;
    const canceladas = tarefas.filter(t => t.status === "cancelada").length;
    const atrasadas = tarefas.filter(t => {
      if (!t.data_vencimento || t.status === "concluida" || t.status === "cancelada") return false;
      return parseLocalDate(t.data_vencimento) < hoje;
    }).length;
    const total = tarefas.length;
    const percentConcluidas = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { pendentes, emAndamento, concluidas, canceladas, atrasadas, total, percentConcluidas };
  }, [tarefas, hoje]);

  const pieData = useMemo(() => [
    { name: "Pendentes", value: dashboardStats.pendentes, color: "hsl(var(--muted-foreground))" },
    { name: "Em Andamento", value: dashboardStats.emAndamento, color: "hsl(var(--primary))" },
    { name: "Concluídas", value: dashboardStats.concluidas, color: "hsl(var(--success))" },
    { name: "Canceladas", value: dashboardStats.canceladas, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0), [dashboardStats]);

  // Aplicar filtros
  const tarefasFiltradas = useMemo(() => {
    if (!tarefas) return [];
    
    return tarefas.filter(tarefa => {
      // Filtro de arquivamento
      if (!mostrarArquivadas && (tarefa.status === "concluida" || tarefa.status === "cancelada")) return false;

      if (comercialFilter !== "todos") {
        const comercialDoCliente = tarefa.cliente_id ? clienteToComercial.get(tarefa.cliente_id) : null;
        if (comercialDoCliente !== comercialFilter) return false;
      }

      if (searchTerm) {
        const termo = searchTerm.toLowerCase();
        const matchTitulo = tarefa.titulo.toLowerCase().includes(termo);
        const matchDescricao = tarefa.descricao?.toLowerCase().includes(termo) || false;
        const matchCliente = tarefa.clientes?.empresa.toLowerCase().includes(termo) || false;
        const matchResponsavel = tarefa.responsavel_nome?.toLowerCase().includes(termo) || false;
        if (!matchTitulo && !matchDescricao && !matchCliente && !matchResponsavel) return false;
      }

      if (filtroPrioridade !== "todos" && tarefa.prioridade !== filtroPrioridade) return false;
      if (filtroCliente !== "todos" && tarefa.clientes?.empresa !== filtroCliente) return false;

      if (filtroPrazo !== "todos") {
        if (!tarefa.data_vencimento) return filtroPrazo === "sem_prazo";
        const vencimento = parseLocalDate(tarefa.data_vencimento);
        if (filtroPrazo === "atrasadas") return vencimento < hoje && tarefa.status !== "concluida";
        if (filtroPrazo === "hoje") return vencimento.getTime() === hoje.getTime();
        if (filtroPrazo === "semana") {
          const umaSemana = new Date(hoje);
          umaSemana.setDate(hoje.getDate() + 7);
          return vencimento >= hoje && vencimento <= umaSemana;
        }
        if (filtroPrazo === "sem_prazo") return false;
      }

      return true;
    });
  }, [tarefas, searchTerm, filtroPrazo, filtroPrioridade, filtroCliente, comercialFilter, clienteToComercial, hoje, mostrarArquivadas]);

  const tarefasHoje = tarefasFiltradas.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    return parseLocalDate(t.data_vencimento).getTime() === hoje.getTime();
  });

  const tarefasAtrasadas = tarefasFiltradas.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    return parseLocalDate(t.data_vencimento) < hoje;
  });

  const tarefasSemana = tarefasFiltradas.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    const vencimento = parseLocalDate(t.data_vencimento);
    const umaSemana = new Date(hoje);
    umaSemana.setDate(hoje.getDate() + 7);
    return vencimento >= hoje && vencimento <= umaSemana;
  });

  const getInitials = (nome: string) => nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string }> = {
      urgente: { className: "bg-destructive text-destructive-foreground" },
      alta: { className: "bg-destructive text-destructive-foreground" },
      media: { className: "bg-warning text-warning-foreground" },
      baixa: { className: "bg-muted text-muted-foreground" },
    };
    const style = config[prioridade] || config.media;
    const label = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
    return <Badge className={style.className}>{label}</Badge>;
  };

  const handleToggleTarefa = async (tarefaId: string, currentStatus: string) => {
    const newStatus = currentStatus === "concluida" ? "pendente" : "concluida";
    await updateTarefa.mutateAsync({ id: tarefaId, data: { status: newStatus } });
  };

  const handleOpenDetail = (tarefa: Tarefa) => {
    setSelectedTarefa(tarefa);
    setDetailOpen(true);
  };

  const limparFiltros = () => {
    setSearchTerm("");
    setFiltroPrazo("todos");
    setFiltroPrioridade("todos");
    setFiltroCliente("todos");
    setComercialFilter("todos");
  };

  const temFiltrosAtivos = searchTerm || filtroPrazo !== "todos" || filtroPrioridade !== "todos" || filtroCliente !== "todos" || comercialFilter !== "todos";

  const getTarefasList = (tarefasList: Tarefa[]) => (
    <div className="space-y-3">
      {!tarefasList || tarefasList.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhuma tarefa</p>
      ) : (
        tarefasList.map((tarefa) => {
          const responsavelNome = tarefa.responsavel_nome;
          return (
            <Card 
              key={tarefa.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleOpenDetail(tarefa)}
            >
              <div className="flex items-start gap-4">
                <Checkbox 
                  className="mt-1" 
                  checked={tarefa.status === "concluida"}
                  onCheckedChange={() => handleToggleTarefa(tarefa.id, tarefa.status)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tarefa.titulo}</h3>
                    <div className="flex items-center gap-2">
                      {getPrioridadeBadge(tarefa.prioridade)}
                    </div>
                  </div>
                  {tarefa.descricao && (
                    <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                  )}
                  {tarefa.clientes && (
                    <Badge variant="outline" className="text-xs">
                      {tarefa.clientes.empresa}
                    </Badge>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {tarefa.data_vencimento && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {responsavelNome ? (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-primary/10">
                            {getInitials(responsavelNome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {responsavelNome}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Sem responsável</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas Comerciais</h1>
          <p className="text-muted-foreground">Gerencie suas atividades diárias</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <TarefaForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard de Status */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-4">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.pendentes}</div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Loader2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.emAndamento}</div>
                  <div className="text-xs text-muted-foreground">Em Andamento</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.concluidas}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.atrasadas}</div>
                  <div className="text-xs text-muted-foreground">Atrasadas</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso geral</span>
                <span className="font-medium">{dashboardStats.percentConcluidas}% concluídas</span>
              </div>
              <Progress value={dashboardStats.percentConcluidas} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descrição, cliente ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 mr-2">
              <Switch
                id="mostrar-arquivadas"
                checked={mostrarArquivadas}
                onCheckedChange={setMostrarArquivadas}
              />
              <Label htmlFor="mostrar-arquivadas" className="text-sm cursor-pointer flex items-center gap-1">
                <Archive className="h-3.5 w-3.5" />
                Concluídas
              </Label>
            </div>

            <Select value={comercialFilter} onValueChange={setComercialFilter}>
              <SelectTrigger className="w-[150px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Comercial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Comerciais</SelectItem>
                {comerciaisDisponiveis.map((codigo) => (
                  <SelectItem key={codigo} value={codigo}>{codigo}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroPrazo} onValueChange={setFiltroPrazo}>
              <SelectTrigger className="w-[150px]">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os prazos</SelectItem>
                <SelectItem value="atrasadas">Atrasadas</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="sem_prazo">Sem prazo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas prioridades</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroCliente} onValueChange={setFiltroCliente}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos clientes</SelectItem>
                {clientesUnicos.map(cliente => (
                  <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {temFiltrosAtivos && (
              <Button variant="ghost" size="sm" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
        {temFiltrosAtivos && (
          <p className="text-sm text-muted-foreground mt-2">
            {tarefasFiltradas.length} tarefa(s) encontrada(s)
          </p>
        )}
      </Card>

      {viewMode === "kanban" ? (
        <KanbanBoard tarefas={tarefasFiltradas} onTaskClick={handleOpenDetail} mostrarArquivadas={mostrarArquivadas} />
      ) : (
        <Tabs defaultValue="hoje" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="atrasadas">Atrasadas</TabsTrigger>
            <TabsTrigger value="semana">Esta Semana</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Tarefas de Hoje</CardTitle></CardHeader>
              <CardContent>{getTarefasList(tarefasHoje)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atrasadas" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Tarefas Atrasadas</CardTitle></CardHeader>
              <CardContent>{getTarefasList(tarefasAtrasadas)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semana" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Tarefas desta Semana</CardTitle></CardHeader>
              <CardContent>{getTarefasList(tarefasSemana)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todas">
            {getTarefasList(tarefasFiltradas)}
          </TabsContent>
        </Tabs>
      )}

      <TarefaDetailDialog 
        tarefa={selectedTarefa} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
}
