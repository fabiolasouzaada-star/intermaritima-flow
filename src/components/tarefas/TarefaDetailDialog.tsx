import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, Building2, FileText, AlertCircle, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useUpdateTarefa, type Tarefa } from "@/hooks/useTarefas";
import { TarefaEditForm } from "@/components/forms/TarefaEditForm";

interface TarefaDetailDialogProps {
  tarefa: Tarefa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TarefaDetailDialog({ tarefa, open, onOpenChange }: TarefaDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTarefa = useUpdateTarefa();

  if (!tarefa) return null;

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string; label: string }> = {
      urgente: { className: "bg-destructive text-destructive-foreground", label: "Urgente" },
      alta: { className: "bg-destructive/80 text-destructive-foreground", label: "Alta" },
      media: { className: "bg-warning text-warning-foreground", label: "Média" },
      baixa: { className: "bg-muted text-muted-foreground", label: "Baixa" },
    };
    const style = config[prioridade] || config.media;
    return <Badge className={style.className}>{style.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pendente: { className: "bg-muted text-muted-foreground", label: "Pendente" },
      em_andamento: { className: "bg-primary/20 text-primary", label: "Em Andamento" },
      concluida: { className: "bg-success/20 text-success", label: "Concluída" },
      cancelada: { className: "bg-destructive/20 text-destructive", label: "Cancelada" },
    };
    const style = config[status] || config.pendente;
    return <Badge className={style.className}>{style.label}</Badge>;
  };

  const isOverdue = () => {
    if (!tarefa.data_vencimento || tarefa.status === "concluida" || tarefa.status === "cancelada") return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(tarefa.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  };

  const handleToggleStatus = async () => {
    const newStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
    await updateTarefa.mutateAsync({ id: tarefa.id, data: { status: newStatus } });
  };

  const handleClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditing ? "Editar Tarefa" : "Detalhes da Tarefa"}
            </div>
            {!isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <TarefaEditForm tarefa={tarefa} onSuccess={handleEditSuccess} />
        ) : (
          <div className="space-y-6">
            {/* Header com título e badges */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold leading-tight">{tarefa.titulo}</h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getPrioridadeBadge(tarefa.prioridade)}
                  {getStatusBadge(tarefa.status)}
                </div>
              </div>
              
              {isOverdue() && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Tarefa atrasada!</span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {tarefa.descricao && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{tarefa.descricao}</p>
              </div>
            )}

            {/* Informações */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Cliente
                </div>
                <div className="text-sm">
                  {tarefa.clientes?.empresa || (
                    <span className="text-muted-foreground italic">Nenhum cliente</span>
                  )}
                </div>
              </div>

              {/* Responsável */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Responsável
                </div>
                <div className="text-sm">
                  {tarefa.responsavel_nome ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px] bg-primary/10">
                          {getInitials(tarefa.responsavel_nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{tarefa.responsavel_nome}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Sem responsável</span>
                  )}
                </div>
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Prazo
                </div>
                <div className={`text-sm ${isOverdue() ? "text-destructive font-medium" : ""}`}>
                  {tarefa.data_vencimento
                    ? new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")
                    : <span className="text-muted-foreground italic">Sem prazo</span>
                  }
                </div>
              </div>

              {/* Data de Criação */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Criada em</div>
                <div className="text-sm">
                  {new Date(tarefa.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </div>

            {/* Ação de conclusão */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="concluida"
                  checked={tarefa.status === "concluida"}
                  onCheckedChange={handleToggleStatus}
                />
                <label htmlFor="concluida" className="text-sm font-medium cursor-pointer">
                  Marcar como {tarefa.status === "concluida" ? "pendente" : "concluída"}
                </label>
              </div>
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
