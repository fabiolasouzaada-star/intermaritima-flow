import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Ship, 
  Calendar, 
  Container, 
  Users,
  UserPlus,
  Target,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { NavioAgregado, PreAlertaItem, useUpdatePreAlertaItem } from "@/hooks/usePreAlertaNavios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavioDetailDialogProps {
  navio: NavioAgregado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", color: "bg-gray-100 text-gray-800" },
  { value: "em_abordagem", label: "Em Abordagem", color: "bg-blue-100 text-blue-800" },
  { value: "proposta_enviada", label: "Proposta Enviada", color: "bg-purple-100 text-purple-800" },
  { value: "convertido", label: "Convertido", color: "bg-emerald-100 text-emerald-800" },
  { value: "descartado", label: "Descartado", color: "bg-red-100 text-red-800" },
];

export function NavioDetailDialog({ navio, open, onOpenChange }: NavioDetailDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateItem = useUpdatePreAlertaItem();
  const [isCreating, setIsCreating] = useState<string | null>(null);

  if (!navio) return null;

  // Aggregate items by client
  const clienteAgregado = navio.itens.reduce((acc, item) => {
    const key = item.cliente_nome;
    if (!acc[key]) {
      acc[key] = {
        cliente_nome: item.cliente_nome,
        cliente_id: item.cliente_id,
        is_cliente_intermaritima: item.is_cliente_intermaritima,
        total_cntr: 0,
        tipos_container: new Set<string>(),
        status_comercial: item.status_comercial,
        itens: [],
      };
    }
    acc[key].total_cntr += item.quantidade;
    if (item.tipo_container) {
      acc[key].tipos_container.add(item.tipo_container);
    }
    acc[key].itens.push(item);
    return acc;
  }, {} as Record<string, any>);

  const clientes = Object.values(clienteAgregado).map((c: any) => ({
    ...c,
    tipos_container: Array.from(c.tipos_container),
  }));

  const handleStatusChange = async (clienteNome: string, newStatus: string) => {
    const clienteData = clienteAgregado[clienteNome];
    if (!clienteData) return;

    // Update all items for this client
    for (const item of clienteData.itens) {
      await updateItem.mutateAsync({
        id: item.id,
        status_comercial: newStatus,
      });
    }
  };

  const handleCreateCliente = async (clienteNome: string) => {
    setIsCreating(clienteNome);
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          empresa: clienteNome,
          segmento: "outros",
          status: "prospecto",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update pre-alerta items with the new client
      const clienteData = clienteAgregado[clienteNome];
      for (const item of clienteData.itens) {
        await updateItem.mutateAsync({
          id: item.id,
          cliente_id: data.id,
          is_cliente_intermaritima: true,
        });
      }

      toast.success(`Cliente "${clienteNome}" criado com sucesso!`);
      navigate(`/cliente/${data.id}`);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente");
    } finally {
      setIsCreating(null);
    }
  };

  const handleCreateOportunidade = async (clienteNome: string, clienteId: string) => {
    setIsCreating(clienteNome);
    try {
      const { data, error } = await supabase
        .from("oportunidades")
        .insert({
          cliente_id: clienteId,
          titulo: `Oportunidade Pré-Alerta - ${navio.navio}`,
          descricao: `Oportunidade gerada a partir do pré-alerta do navio ${navio.navio}`,
          status: "qualificacao",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Oportunidade criada com sucesso!");
      navigate("/pipeline");
    } catch (error) {
      console.error("Erro ao criar oportunidade:", error);
      toast.error("Erro ao criar oportunidade");
    } finally {
      setIsCreating(null);
    }
  };

  const handleCreateTarefa = async (clienteNome: string, clienteId: string | null) => {
    setIsCreating(clienteNome);
    try {
      const { data, error } = await supabase
        .from("tarefas")
        .insert({
          titulo: `Abordagem Pré-Alerta - ${clienteNome}`,
          descricao: `Abordar cliente ${clienteNome} referente ao navio ${navio.navio} (${navio.itens.find(i => i.cliente_nome === clienteNome)?.quantidade || 0} CNTR)`,
          status: "pendente",
          prioridade: "alta",
          cliente_id: clienteId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Tarefa criada com sucesso!");
      navigate("/tarefas");
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      toast.error("Erro ao criar tarefa");
    } finally {
      setIsCreating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ship className="h-5 w-5" />
            {navio.navio}
            {navio.nv && <span className="text-muted-foreground text-base">({navio.nv})</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ship summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ETA:</span>
              <span className="font-medium">
                {navio.eta 
                  ? format(new Date(navio.eta), "dd/MM/yyyy", { locale: ptBR })
                  : "N/A"
                }
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ship className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Armador:</span>
              <span className="font-medium">{navio.armador || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Container className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total CNTR:</span>
              <span className="font-bold text-lg">{navio.total_cntr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Clientes:</span>
              <span className="font-medium">{navio.total_clientes}</span>
            </div>
          </div>

          {/* Container types */}
          <div className="flex flex-wrap gap-2">
            {navio.tipos_container.map((tipo) => (
              <Badge key={tipo} variant="secondary">{tipo}</Badge>
            ))}
          </div>

          {/* Clients table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">CNTR</TableHead>
                  <TableHead className="text-center">Tipos</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes
                  .sort((a: any, b: any) => b.total_cntr - a.total_cntr)
                  .map((cliente: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cliente.is_cliente_intermaritima ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-orange-600" />
                          )}
                          <span className="font-medium">{cliente.cliente_nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {cliente.total_cntr}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {cliente.tipos_container.slice(0, 2).map((tipo: string) => (
                            <Badge key={tipo} variant="outline" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                          {cliente.tipos_container.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{cliente.tipos_container.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={cliente.status_comercial}
                          onValueChange={(value) => handleStatusChange(cliente.cliente_nome, value)}
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-center flex-wrap">
                          {!cliente.is_cliente_intermaritima ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateCliente(cliente.cliente_nome)}
                              disabled={isCreating === cliente.cliente_nome}
                            >
                              {isCreating === cliente.cliente_nome ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Cliente
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateOportunidade(cliente.cliente_nome, cliente.cliente_id)}
                              disabled={isCreating === cliente.cliente_nome}
                            >
                              {isCreating === cliente.cliente_nome ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Target className="h-4 w-4 mr-1" />
                                  Oportunidade
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCreateTarefa(cliente.cliente_nome, cliente.cliente_id)}
                            disabled={isCreating === cliente.cliente_nome}
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Tarefa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
