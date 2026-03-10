import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, GripVertical } from "lucide-react";
import { useUpdateTarefa, type Tarefa } from "@/hooks/useTarefas";
import type { Database } from "@/integrations/supabase/types";

type StatusTarefa = Database["public"]["Enums"]["status_tarefa"];

interface KanbanBoardProps {
  tarefas: Tarefa[];
  onTaskClick?: (tarefa: Tarefa) => void;
  mostrarArquivadas?: boolean;
}

const STATUS_COLUMNS: { key: StatusTarefa; label: string; color: string }[] = [
  { key: "pendente", label: "Pendente", color: "bg-muted" },
  { key: "em_andamento", label: "Em Andamento", color: "bg-primary/10" },
  { key: "concluida", label: "Concluída", color: "bg-success/10" },
  { key: "cancelada", label: "Cancelada", color: "bg-destructive/10" },
];

export function KanbanBoard({ tarefas, onTaskClick, mostrarArquivadas = true }: KanbanBoardProps) {
  const updateTarefa = useUpdateTarefa();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const visibleColumns = mostrarArquivadas
    ? STATUS_COLUMNS
    : STATUS_COLUMNS.filter(c => c.key !== "concluida" && c.key !== "cancelada");

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string }> = {
      urgente: { className: "bg-destructive text-destructive-foreground" },
      alta: { className: "bg-destructive/80 text-destructive-foreground" },
      media: { className: "bg-warning text-warning-foreground" },
      baixa: { className: "bg-muted text-muted-foreground" },
    };
    const style = config[prioridade] || config.media;
    const label = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
    return <Badge className={style.className}>{label}</Badge>;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: StatusTarefa) => {
    e.preventDefault();
    if (draggedTask) {
      await updateTarefa.mutateAsync({
        id: draggedTask,
        data: { status: newStatus },
      });
      setDraggedTask(null);
    }
  };

  const isOverdue = (dataVencimento: string | null) => {
    if (!dataVencimento) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    // Parsear data como local (YYYY-MM-DD)
    const [year, month, day] = dataVencimento.split('-').map(Number);
    const vencimento = new Date(year, month - 1, day);
    return vencimento < hoje;
  };

  const handleCardClick = (tarefa: Tarefa) => {
    if (onTaskClick) {
      onTaskClick(tarefa);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((column) => {
        const columnTarefas = tarefas.filter((t) => t.status === column.key);
        return (
          <div
            key={column.key}
            className={`rounded-lg p-4 ${column.color} min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnTarefas.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columnTarefas.map((tarefa) => {
                const responsavelNome = tarefa.responsavel_nome;
                const overdue =
                  tarefa.status !== "concluida" &&
                  tarefa.status !== "cancelada" &&
                  isOverdue(tarefa.data_vencimento);

                return (
                  <Card
                    key={tarefa.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tarefa.id)}
                    onClick={() => handleCardClick(tarefa)}
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      draggedTask === tarefa.id ? "opacity-50" : ""
                    } ${overdue ? "border-destructive" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 cursor-grab" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight break-words">
                            {tarefa.titulo}
                          </h4>
                          {getPrioridadeBadge(tarefa.prioridade)}
                        </div>

                        {tarefa.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {tarefa.descricao}
                          </p>
                        )}

                        {tarefa.clientes && (
                          <Badge variant="outline" className="text-xs">
                            {tarefa.clientes.empresa}
                          </Badge>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          {tarefa.data_vencimento ? (
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                overdue
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {new Date(tarefa.data_vencimento).toLocaleDateString(
                                "pt-BR"
                              )}
                            </div>
                          ) : (
                            <span />
                          )}

                          {responsavelNome ? (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-primary/10">
                                  {getInitials(responsavelNome)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                {responsavelNome.split(" ")[0]}
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
              })}

              {columnTarefas.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma tarefa
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
