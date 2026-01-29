import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, GripVertical, AlertTriangle } from "lucide-react";
import { useUpdateAcaoReuniao, type AcaoReuniao, type StatusAcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO } from "@/hooks/useAcoesReuniao";
import { AREAS_ENVOLVIDAS } from "@/hooks/useReunioes";
import { useState } from "react";

interface AcoesKanbanProps {
  acoes: AcaoReuniao[];
  onAcaoClick?: (acao: AcaoReuniao) => void;
}

const STATUS_COLUMNS: { key: StatusAcaoReuniao; label: string; color: string }[] = [
  { key: "nao_iniciada", label: "Não Iniciada", color: "bg-muted" },
  { key: "em_andamento", label: "Em Andamento", color: "bg-primary/10" },
  { key: "concluida", label: "Concluída", color: "bg-success/10" },
  { key: "atrasada", label: "Atrasada", color: "bg-destructive/10" },
];

export function AcoesKanban({ acoes, onAcaoClick }: AcoesKanbanProps) {
  const updateAcao = useUpdateAcaoReuniao();
  const [draggedAcao, setDraggedAcao] = useState<string | null>(null);

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config = PRIORIDADES_ACAO.find((p) => p.value === prioridade);
    return <Badge className={config?.color || ""}>{config?.label || prioridade}</Badge>;
  };

  const getAreaLabel = (area: string) => {
    return AREAS_ENVOLVIDAS.find((a) => a.value === area)?.label || area;
  };

  const handleDragStart = (e: React.DragEvent, acaoId: string) => {
    setDraggedAcao(acaoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: StatusAcaoReuniao) => {
    e.preventDefault();
    if (draggedAcao) {
      await updateAcao.mutateAsync({
        id: draggedAcao,
        data: { status: newStatus },
      });
      setDraggedAcao(null);
    }
  };

  const isOverdue = (prazo: string | null, status: StatusAcaoReuniao) => {
    if (!prazo || status === "concluida") return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [year, month, day] = prazo.split("-").map(Number);
    const prazoDate = new Date(year, month - 1, day);
    return prazoDate < hoje;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATUS_COLUMNS.map((column) => {
        const columnAcoes = acoes.filter((a) => a.status === column.key);
        return (
          <div
            key={column.key}
            className={`rounded-lg p-4 ${column.color} min-h-[400px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnAcoes.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columnAcoes.map((acao) => {
                const responsavelNome = acao.profiles?.nome;
                const overdue = isOverdue(acao.prazo, acao.status);

                return (
                  <Card
                    key={acao.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, acao.id)}
                    onClick={() => onAcaoClick?.(acao)}
                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      draggedAcao === acao.id ? "opacity-50" : ""
                    } ${overdue ? "border-destructive" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 cursor-grab" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm leading-tight break-words line-clamp-2">
                            {acao.acao}
                          </h4>
                          {getPrioridadeBadge(acao.prioridade)}
                        </div>

                        {acao.clientes && (
                          <Badge variant="outline" className="text-xs">
                            {acao.clientes.empresa}
                          </Badge>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {getAreaLabel(acao.area_responsavel)}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          {acao.prazo ? (
                            <div
                              className={`flex items-center gap-1 text-xs ${
                                overdue
                                  ? "text-destructive font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {overdue && <AlertTriangle className="h-3 w-3" />}
                              <Clock className="h-3 w-3" />
                              {new Date(acao.prazo).toLocaleDateString("pt-BR")}
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
                              <span className="text-xs text-muted-foreground truncate max-w-[60px]">
                                {responsavelNome.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {columnAcoes.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma ação
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
