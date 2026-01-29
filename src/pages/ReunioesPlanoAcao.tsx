import { useState } from "react";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Calendar, Users, Target, Kanban, LayoutDashboard, 
  Building2, Clock, AlertTriangle, Search, Table as TableIcon, UserCircle
} from "lucide-react";
import { useReunioes, TIPOS_REUNIAO, STATUS_REUNIAO, AREAS_ENVOLVIDAS, type Reuniao } from "@/hooks/useReunioes";
import { useAllAcoesReuniao, type AcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO } from "@/hooks/useAcoesReuniao";
import { useAllTarefasAcao, STATUS_TAREFA_ACAO } from "@/hooks/useTarefasAcao";
import { ReuniaoForm } from "@/components/reunioes/ReuniaoForm";
import { ReuniaoDetailDialog } from "@/components/reunioes/ReuniaoDetailDialog";
import { AcoesKanban } from "@/components/reunioes/AcoesKanban";
import { AcoesTableView } from "@/components/reunioes/AcoesTableView";
import { ReunioesPlanoAcaoDashboard } from "@/components/reunioes/ReunioesPlanoAcaoDashboard";
import { useProfiles } from "@/hooks/useProfiles";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

export default function ReunioesPlanoAcao() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);
  const [selectedAcao, setSelectedAcao] = useState<AcaoReuniao | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroComercial, setFiltroComercial] = useState("");

  const { data: reunioes, isLoading: isLoadingReunioes } = useReunioes();
  const { data: acoes, isLoading: isLoadingAcoes } = useAllAcoesReuniao();
  const { data: tarefas, isLoading: isLoadingTarefas } = useAllTarefasAcao();
  const { data: profiles } = useProfiles();
  const { isAdmin, isManager } = useUserRole();
  const { user } = useAuth();

  const isAdminOrManager = isAdmin || isManager;

  // Lista de comerciais (usuários que criaram ações)
  const comerciais = [...new Map(
    acoes?.filter((a) => a.created_by).map((a) => {
      const profile = profiles?.find((p) => p.id === a.created_by);
      return [a.created_by, profile?.nome || "Desconhecido"];
    }) || []
  ).entries()].map(([id, nome]) => ({ id: id!, nome: nome! })).filter((c) => c.id && c.nome);

  // Filtrar reuniões
  const filteredReunioes = reunioes?.filter((r) => {
    if (searchTerm && !r.objetivo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.clientes?.empresa.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filtro por comercial (criador)
    if (filtroComercial && r.created_by !== filtroComercial) return false;
    return true;
  });

  // Filtrar ações
  const filteredAcoes = acoes?.filter((a) => {
    if (searchTerm && !a.acao.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !a.clientes?.empresa?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filtroCliente && a.cliente_id !== filtroCliente) return false;
    if (filtroResponsavel && a.responsavel_id !== filtroResponsavel) return false;
    if (filtroStatus && a.status !== filtroStatus) return false;
    // Filtro por comercial (criador)
    if (filtroComercial && a.created_by !== filtroComercial) return false;
    return true;
  }) || [];

  // Tarefas atrasadas
  const tarefasAtrasadas = tarefas?.filter((t) => t.status === "atrasada") || [];

  // Clientes únicos das ações
  const clientesUnicos = [...new Map(
    acoes?.filter((a) => a.clientes).map((a) => [a.cliente_id, a.clientes?.empresa]) || []
  ).entries()].map(([id, nome]) => ({ id: id!, nome: nome! }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizada": return "bg-success/20 text-success";
      case "em_andamento": return "bg-primary/20 text-primary";
      case "cancelada": return "bg-destructive/20 text-destructive";
      default: return "";
    }
  };

  const handleReuniaoClick = (reuniao: Reuniao) => {
    setSelectedReuniao(reuniao);
  };

  const handleAcaoClick = (acao: AcaoReuniao) => {
    // Encontrar a reunião da ação
    const reuniao = reunioes?.find((r) => r.id === acao.reuniao_id);
    if (reuniao) {
      setSelectedReuniao(reuniao);
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Reuniões & Plano de Ação</h1>
              <p className="text-sm text-muted-foreground">
                Transforme reuniões em decisões, ações e tarefas acompanháveis
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filtro por Comercial (apenas para admin/manager) */}
              {isAdminOrManager && comerciais.length > 0 && (
                <Select value={filtroComercial || "all"} onValueChange={(v) => setFiltroComercial(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      <SelectValue placeholder="Comercial" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Comerciais</SelectItem>
                    {comerciais.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reunião
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Registrar Reunião
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(90vh-100px)]">
                    <div className="pr-4">
                      <ReuniaoForm onSuccess={() => setDialogOpen(false)} />
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Indicator de filtro ativo */}
          {filtroComercial && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <UserCircle className="h-3 w-3" />
                Filtrando por: {comerciais.find((c) => c.id === filtroComercial)?.nome}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => setFiltroComercial("")}
                >
                  ×
                </Button>
              </Badge>
            </div>
          )}
        </div>

        {/* Tabs de Visualização */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="reunioes" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reuniões</span>
            </TabsTrigger>
            <TabsTrigger value="kanban" className="text-xs sm:text-sm">
              <Kanban className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="lista" className="text-xs sm:text-sm">
              <TableIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="atrasadas" className="text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Atrasadas</span>
              {tarefasAtrasadas.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {tarefasAtrasadas.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-4">
            <ReunioesPlanoAcaoDashboard />
          </TabsContent>

          {/* Lista de Reuniões */}
          <TabsContent value="reunioes" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por objetivo ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoadingReunioes ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredReunioes && filteredReunioes.length > 0 ? (
              <div className="space-y-3">
                {filteredReunioes.map((reuniao) => {
                  const tipoLabel = TIPOS_REUNIAO.find((t) => t.value === reuniao.tipo)?.label;
                  const statusLabel = STATUS_REUNIAO.find((s) => s.value === reuniao.status)?.label;
                  const reuniaoAcoes = acoes?.filter((a) => a.reuniao_id === reuniao.id) || [];
                  
                  // Usar areas_envolvidas se disponível, senão fallback para area_envolvida
                  const areasToShow = reuniao.areas_envolvidas?.length > 0 
                    ? reuniao.areas_envolvidas 
                    : [reuniao.area_envolvida];

                  return (
                    <Card
                      key={reuniao.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleReuniaoClick(reuniao)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(reuniao.data_reuniao).toLocaleString("pt-BR")}
                            </span>
                            <Badge className={getStatusColor(reuniao.status)}>{statusLabel}</Badge>
                          </div>

                          {reuniao.clientes && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{reuniao.clientes.empresa}</span>
                            </div>
                          )}

                          {reuniao.objetivo && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {reuniao.objetivo}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{tipoLabel}</Badge>
                            {areasToShow.map((area) => {
                              const areaLabel = AREAS_ENVOLVIDAS.find((a) => a.value === area)?.label || area;
                              return (
                                <Badge key={area} variant="secondary">{areaLabel}</Badge>
                              );
                            })}
                            {reuniaoAcoes.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Target className="h-3 w-3 mr-1" />
                                {reuniaoAcoes.length} ação(ões)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma reunião encontrada
              </div>
            )}
          </TabsContent>

          {/* Kanban de Ações */}
          <TabsContent value="kanban" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={filtroCliente || "all"} onValueChange={(v) => setFiltroCliente(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clientesUnicos.filter((c) => c.id && c.id.trim() !== "").map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroResponsavel || "all"} onValueChange={(v) => setFiltroResponsavel(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os responsáveis</SelectItem>
                  {profiles?.filter((p) => p.id && p.id.trim() !== "").map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filtroCliente || filtroResponsavel) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroCliente("");
                    setFiltroResponsavel("");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            {isLoadingAcoes ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <AcoesKanban acoes={filteredAcoes} onAcaoClick={handleAcaoClick} />
            )}
          </TabsContent>

          {/* Lista de Ações em Tabela Excel-like */}
          <TabsContent value="lista" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroStatus || "all"} onValueChange={(v) => setFiltroStatus(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUS_ACAO.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroResponsavel || "all"} onValueChange={(v) => setFiltroResponsavel(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles?.filter((p) => p.id && p.id.trim() !== "").map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(filtroStatus || filtroResponsavel || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroStatus("");
                    setFiltroResponsavel("");
                    setSearchTerm("");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            {isLoadingAcoes ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <AcoesTableView acoes={filteredAcoes} />
            )}
          </TabsContent>

          {/* Tarefas Atrasadas */}
          <TabsContent value="atrasadas" className="mt-4 space-y-4">
            {isLoadingTarefas ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : tarefasAtrasadas.length > 0 ? (
              <div className="space-y-2">
                {tarefasAtrasadas.map((tarefa) => {
                  const statusConfig = STATUS_TAREFA_ACAO.find((s) => s.value === tarefa.status);

                  return (
                    <Card
                      key={tarefa.id}
                      className="p-3 border-destructive"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="font-medium">{tarefa.descricao}</span>
                          </div>
                          {tarefa.acoes_reuniao && (
                            <p className="text-sm text-muted-foreground">
                              Ação: {tarefa.acoes_reuniao.acao}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {tarefa.data_final && (
                            <span className="flex items-center gap-1 text-destructive">
                              <Clock className="h-3 w-3" />
                              {new Date(tarefa.data_final).toLocaleString("pt-BR")}
                            </span>
                          )}
                          {tarefa.profiles?.nome && (
                            <span>{tarefa.profiles.nome}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="text-lg font-medium text-success">Parabéns!</p>
                <p>Não há tarefas atrasadas no momento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Detalhes da Reunião */}
      <ReuniaoDetailDialog
        reuniao={selectedReuniao}
        open={!!selectedReuniao}
        onOpenChange={(open) => !open && setSelectedReuniao(null)}
      />
    </CRMLayout>
  );
}
