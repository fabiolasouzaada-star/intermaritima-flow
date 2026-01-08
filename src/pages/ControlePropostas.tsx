import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, CheckCircle, XCircle, Clock, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropostasCliente, useDeletePropostaCliente, PropostaCliente } from "@/hooks/usePropostasCliente";
import { PropostaClienteForm } from "@/components/forms/PropostaClienteForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  em_analise: { label: "Em Análise", variant: "default", icon: FileText },
  aprovada: { label: "Aprovada", variant: "outline", icon: CheckCircle },
  rejeitada: { label: "Rejeitada", variant: "destructive", icon: XCircle },
};

const TIPOS_SERVICO = [
  "ALFANDEGADO FCL",
  "ALFANDEGADO LCL",
  "ALFANDEGADO BB",
  "TRANSPORTE",
  "ARMAZÉM GERAL",
  "ALF + OPERAÇÃO PORTUÁRIA",
  "EXPORTAÇÃO",
];

export default function ControlePropostas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProposta, setEditProposta] = useState<PropostaCliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [servicoFilter, setServicoFilter] = useState<string>("todos");
  
  const { data: propostas, isLoading } = usePropostasCliente();
  const deleteProposta = useDeletePropostaCliente();

  const filteredPropostas = propostas?.filter((proposta) => {
    const matchesSearch = 
      proposta.numero_proposta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.clientes?.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || proposta.status === statusFilter;
    const matchesServico = servicoFilter === "todos" || proposta.tipo_servico === servicoFilter;
    return matchesSearch && matchesStatus && matchesServico;
  });

  const stats = {
    total: propostas?.length || 0,
    pendentes: propostas?.filter(p => p.status === "pendente").length || 0,
    aprovadas: propostas?.filter(p => p.status === "aprovada").length || 0,
    rejeitadas: propostas?.filter(p => p.status === "rejeitada").length || 0,
  };

  const handleEdit = (proposta: PropostaCliente) => {
    setEditProposta(proposta);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteProposta.mutateAsync(id);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditProposta(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Controle de Propostas</h1>
          <p className="text-muted-foreground">Gerencie propostas por cliente e serviço</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditProposta(null);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => {
              setEditProposta(null);
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editProposta ? "Editar Proposta" : "Nova Proposta"}</DialogTitle>
            </DialogHeader>
            <PropostaClienteForm 
              proposta={editProposta || undefined} 
              onSuccess={() => {
                setDialogOpen(false);
                setEditProposta(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aprovadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejeitadas}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Propostas</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={servicoFilter} onValueChange={setServicoFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Serviços</SelectItem>
                  {TIPOS_SERVICO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPropostas?.map((proposta) => {
                const status = statusConfig[proposta.status || "pendente"];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={proposta.id}>
                    <TableCell className="font-medium">{proposta.numero_proposta}</TableCell>
                    <TableCell>
                      {proposta.data_proposta
                        ? new Date(proposta.data_proposta).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>{proposta.clientes?.empresa || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{proposta.tipo_servico || proposta.servico}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {proposta.vencimento_proposta
                        ? new Date(proposta.vencimento_proposta).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(proposta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(proposta.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!filteredPropostas || filteredPropostas.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma proposta encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
