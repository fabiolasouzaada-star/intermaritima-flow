import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Calendar, TrendingUp, GripVertical } from "lucide-react";
import { useUpdateOportunidade, type Oportunidade } from "@/hooks/useOportunidades";
import { OportunidadeEditForm } from "@/components/forms/OportunidadeEditForm";
import type { Database } from "@/integrations/supabase/types";

type StatusOportunidade = Database["public"]["Enums"]["status_oportunidade"];

interface PipelineKanbanProps {
  oportunidades: Oportunidade[];
}

const statusMap: Record<StatusOportunidade, string> = {
  qualificacao: "Prospecção",
  proposta: "Proposta Enviada",
  negociacao: "Negociação",
  fechamento: "Fechamento",
  ganho: "Ganho",
  perdido: "Perdido"
};

const statusColors: Record<StatusOportunidade, string> = {
  qualificacao: "bg-gray-500",
  proposta: "bg-yellow-500",
  negociacao: "bg-orange-500",
  fechamento: "bg-green-600",
  ganho: "bg-green-700",
  perdido: "bg-red-500"
};

const STATUS_COLUMNS: StatusOportunidade[] = [
  "qualificacao",
  "proposta",
  "negociacao",
  "fechamento",
  "ganho",
  "perdido"
];

export function PipelineKanban({ oportunidades }: PipelineKanbanProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingOportunidade, setEditingOportunidade] = useState<Oportunidade | null>(null);
  const updateOportunidade = useUpdateOportunidade();

  const groupedOportunidades = oportunidades.reduce((acc, oportunidade) => {
    const status = oportunidade.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(oportunidade);
    return acc;
  }, {} as Record<StatusOportunidade, Oportunidade[]>);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: StatusOportunidade) => {
    e.preventDefault();
    
    if (!draggedId) return;

    const oportunidade = oportunidades.find(op => op.id === draggedId);
    if (!oportunidade || oportunidade.status === newStatus) {
      setDraggedId(null);
      return;
    }

    await updateOportunidade.mutateAsync({
      id: draggedId,
      data: { status: newStatus }
    });

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((statusKey) => {
          const deals = groupedOportunidades[statusKey] || [];
          return (
            <Card 
              key={statusKey} 
              className="min-w-[250px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, statusKey)}
            >
              <CardHeader className={`${statusColors[statusKey]} text-white rounded-t-lg py-3`}>
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {statusMap[statusKey]}
                  <Badge className="bg-white/20 text-white border-0">{deals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 bg-muted/30 min-h-[400px]">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2 p-1">
                    {deals.map((deal) => (
                      <Card 
                        key={deal.id} 
                        className={`p-3 cursor-grab active:cursor-grabbing border-2 transition-all hover:border-primary hover:shadow-md ${
                          draggedId === deal.id ? "opacity-50 border-primary" : ""
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setEditingOportunidade(deal)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {deal.clientes?.empresa || "Cliente não informado"}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">{deal.titulo}</p>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs pl-6">
                            {deal.valor && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.valor)}
                              </div>
                            )}
                            {deal.probabilidade && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                {deal.probabilidade}%
                              </div>
                            )}
                            {deal.previsao_fechamento && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(deal.previsao_fechamento).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {deals.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        Arraste cards aqui
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingOportunidade} onOpenChange={(open) => !open && setEditingOportunidade(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oportunidade</DialogTitle>
          </DialogHeader>
          {editingOportunidade && (
            <OportunidadeEditForm 
              oportunidade={editingOportunidade} 
              onSuccess={() => setEditingOportunidade(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
