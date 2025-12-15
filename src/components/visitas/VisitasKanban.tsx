import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Calendar, Building2 } from "lucide-react";
import { useUpdateVisita, type Visita } from "@/hooks/useVisitas";
import type { Database } from "@/integrations/supabase/types";

type StatusVisita = Database["public"]["Enums"]["status_visita"];

interface VisitasKanbanProps {
  visitas: Visita[];
  onVisitaClick?: (visita: Visita) => void;
}

const STATUS_COLUMNS: { key: StatusVisita; label: string; color: string }[] = [
  { key: "agendada", label: "A Agendar", color: "bg-muted" },
  { key: "realizada", label: "Agendadas", color: "bg-primary/10" },
  { key: "cancelada", label: "Realizadas", color: "bg-success/10" },
];

// Mapeamento customizado para a lógica do Kanban
const KANBAN_COLUMNS = [
  { key: "pending", label: "A Agendar", color: "bg-muted", filter: (v: Visita) => v.status === "agendada" && new Date(v.data_visita) > new Date() },
  { key: "scheduled", label: "Agendadas", color: "bg-primary/10", filter: (v: Visita) => v.status === "agendada" },
  { key: "done", label: "Realizadas", color: "bg-success/10", filter: (v: Visita) => v.status === "realizada" },
];

export function VisitasKanban({ visitas, onVisitaClick }: VisitasKanbanProps) {
  const updateVisita = useUpdateVisita();
  const [draggedVisita, setDraggedVisita] = useState<string | null>(null);

  const handleCardClick = (visita: Visita) => {
    if (onVisitaClick) {
      onVisitaClick(visita);
    }
  };

  const handleDragStart = (e: React.DragEvent, visitaId: string) => {
    setDraggedVisita(visitaId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: StatusVisita) => {
    e.preventDefault();
    if (draggedVisita) {
      await updateVisita.mutateAsync({
        id: draggedVisita,
        data: { status: newStatus },
      });
      setDraggedVisita(null);
    }
  };

  const getVisitasByStatus = (status: StatusVisita) => {
    return visitas.filter((v) => v.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATUS_COLUMNS.map((column) => {
        const columnVisitas = getVisitasByStatus(column.key);
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
                {columnVisitas.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {columnVisitas.map((visita) => (
                <Card
                  key={visita.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, visita.id)}
                  onClick={() => handleCardClick(visita)}
                  className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                    draggedVisita === visita.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm leading-tight truncate">
                          {visita.clientes?.empresa || "Cliente não informado"}
                        </h4>
                      </div>

                      {visita.objetivo && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {visita.objetivo}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
                        <Calendar className="h-3 w-3" />
                        {new Date(visita.data_visita).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {columnVisitas.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma visita
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
