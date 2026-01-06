import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Search, Filter, Eye, Pencil, Trash2, Calendar, User, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePlanoAcoes, useDeletePlanoAcao, type PlanoAcao, type StatusAcao, type PrioridadeAcao } from "@/hooks/usePlanoAcoes";
import { useClientes } from "@/hooks/useClientes";
import { PlanoAcaoForm } from "@/components/forms/PlanoAcaoForm";
import { PlanoAcaoEditForm } from "@/components/forms/PlanoAcaoEditForm";

const statusConfig: Record<StatusAcao, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  concluida: { label: "Concluída", variant: "outline" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

const prioridadeConfig: Record<PrioridadeAcao, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  baixa: { label: "Baixa", variant: "outline" },
  media: { label: "Média", variant: "secondary" },
  alta: { label: "Alta", variant: "default" },
  urgente: { label: "Urgente", variant: "destructive" },
};

export default function PlanoAcoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAcao, setSelectedAcao] = useState<PlanoAcao | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>("all");
  const [comercialFilter, setComercialFilter] = useState<string>("all");

  const { data: acoes, isLoading } = usePlanoAcoes();
  const { data: clientes } = useClientes();
  const deleteAcao = useDeletePlanoAcao();

  // Extrair comerciais únicos (códigos) dos clientes
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

  // Mapa de cliente_id para responsavel_codigo
  const clienteToComercial = useMemo(() => {
    const map = new Map<string, string>();
    clientes?.forEach(c => {
      if (c.responsavel_codigo) {
        map.set(c.id, c.responsavel_codigo);
      }
    });
    return map;
  }, [clientes]);

  const filteredAcoes = useMemo(() => {
    if (!acoes) return [];
    return acoes.filter((acao) => {
      const matchesSearch =
        acao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acao.clientes?.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acao.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || acao.status === statusFilter;
      const matchesPrioridade = prioridadeFilter === "all" || acao.prioridade === prioridadeFilter;
      
      // Filtro por comercial (baseado no cliente)
      const comercialDoCliente = clienteToComercial.get(acao.cliente_id);
      const matchesComercial = comercialFilter === "all" || comercialDoCliente === comercialFilter;
      
      return matchesSearch && matchesStatus && matchesPrioridade && matchesComercial;
    });
  }, [acoes, searchTerm, statusFilter, prioridadeFilter, comercialFilter, clienteToComercial]);

  const stats = useMemo(() => {
    const dataToCount = comercialFilter === "all" ? acoes : filteredAcoes;
    if (!dataToCount) return { total: 0, pendentes: 0, emAndamento: 0, concluidas: 0 };
    return {
      total: dataToCount.length,
      pendentes: dataToCount.filter((a) => a.status === "pendente").length,
      emAndamento: dataToCount.filter((a) => a.status === "em_andamento").length,
      concluidas: dataToCount.filter((a) => a.status === "concluida").length,
    };
  }, [acoes, filteredAcoes, comercialFilter]);

  const handleView = (acao: PlanoAcao) => {
    setSelectedAcao(acao);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (acao: PlanoAcao) => {
    setSelectedAcao(acao);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAcao.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plano de Ações</h1>
          <p className="text-muted-foreground">Gerencie as ações e tratativas com clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Ação</DialogTitle>
              <DialogDescription>Crie uma nova ação para acompanhamento de cliente</DialogDescription>
            </DialogHeader>
            <PlanoAcaoForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.emAndamento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.concluidas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={comercialFilter} onValueChange={setComercialFilter}>
          <SelectTrigger className="w-[200px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Comercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os comerciais</SelectItem>
            {comerciaisDisponiveis.map((codigo) => (
              <SelectItem key={codigo} value={codigo}>
                {codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas prioridades</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Comercial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="max-w-[200px]">Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredAcoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhuma ação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAcoes.map((acao) => (
                  <TableRow key={acao.id}>
                    <TableCell className="font-medium">{acao.titulo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {acao.clientes?.empresa || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {clienteToComercial.get(acao.cliente_id) ? (
                        <Badge variant="outline">
                          {clienteToComercial.get(acao.cliente_id)}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[acao.status].variant}>
                        {statusConfig[acao.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={prioridadeConfig[acao.prioridade].variant}>
                        {prioridadeConfig[acao.prioridade].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {acao.data_limite ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(acao.data_limite), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {acao.observacoes || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(acao)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(acao)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(acao.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Ação</DialogTitle>
            <DialogDescription>Visualize os detalhes completos da ação</DialogDescription>
          </DialogHeader>
          {selectedAcao && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Título</h4>
                <p className="text-lg font-semibold">{selectedAcao.titulo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Cliente</h4>
                  <p>{selectedAcao.clientes?.empresa || "-"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Comercial</h4>
                  <p>{clienteToComercial.get(selectedAcao.cliente_id) || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge variant={statusConfig[selectedAcao.status].variant}>
                    {statusConfig[selectedAcao.status].label}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Prioridade</h4>
                  <Badge variant={prioridadeConfig[selectedAcao.prioridade].variant}>
                    {prioridadeConfig[selectedAcao.prioridade].label}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Prazo</h4>
                <p>
                  {selectedAcao.data_limite
                    ? format(new Date(selectedAcao.data_limite), "dd/MM/yyyy", { locale: ptBR })
                    : "Sem prazo definido"}
                </p>
              </div>
              {selectedAcao.descricao && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
                  <p className="whitespace-pre-wrap">{selectedAcao.descricao}</p>
                </div>
              )}
              {selectedAcao.observacoes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
                  <p className="whitespace-pre-wrap">{selectedAcao.observacoes}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Criado em</h4>
                <p>{format(new Date(selectedAcao.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Ação</DialogTitle>
            <DialogDescription>Atualize os dados da ação</DialogDescription>
          </DialogHeader>
          {selectedAcao && (
            <PlanoAcaoEditForm
              acao={selectedAcao}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
