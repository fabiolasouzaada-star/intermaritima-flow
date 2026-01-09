import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Calendar, TrendingUp, GripVertical, ClipboardList } from "lucide-react";
import { useUpdateOportunidade, type Oportunidade } from "@/hooks/useOportunidades";
import { useCreatePlanoAcao } from "@/hooks/usePlanoAcoes";
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
  perdido: "Perdido",
  sem_retorno: "Sem Retorno"
};

const statusColors: Record<StatusOportunidade, string> = {
  qualificacao: "bg-gray-500",
  proposta: "bg-yellow-500",
  negociacao: "bg-orange-500",
  fechamento: "bg-green-600",
  ganho: "bg-green-700",
  perdido: "bg-red-500",
  sem_retorno: "bg-slate-400"
};

const STATUS_COLUMNS: StatusOportunidade[] = [
  "qualificacao",
  "proposta",
  "negociacao",
  "fechamento",
  "ganho",
  "perdido",
  "sem_retorno"
];

const MOTIVOS_PERDA = [
  "Preço",
  "Concorrência",
  "Prazo de entrega",
  "Falta de orçamento do cliente",
  "Mudança de prioridades do cliente",
  "Serviço não atende necessidades",
  "Relacionamento com outro fornecedor",
  "Projeto cancelado",
  "Decisão adiada",
  "Outro"
];

export function PipelineKanban({ oportunidades }: PipelineKanbanProps) {
  const navigate = useNavigate();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingOportunidade, setEditingOportunidade] = useState<Oportunidade | null>(null);
  const [perdaDialogOpen, setPerdaDialogOpen] = useState(false);
  const [pendingPerdaId, setPendingPerdaId] = useState<string | null>(null);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [descricaoPerda, setDescricaoPerda] = useState("");
  const updateOportunidade = useUpdateOportunidade();
  const createPlanoAcao = useCreatePlanoAcao();

  const handleCreatePlanoAcao = async (e: React.MouseEvent, deal: Oportunidade) => {
    e.stopPropagation();
    
    const valorFormatado = deal.valor 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.valor)
      : '';
    
    const descricao = [
      `Oportunidade: ${deal.titulo}`,
      valorFormatado ? `Valor: ${valorFormatado}` : '',
      deal.probabilidade ? `Probabilidade: ${deal.probabilidade}%` : '',
      deal.previsao_fechamento ? `Previsão: ${new Date(deal.previsao_fechamento).toLocaleDateString('pt-BR')}` : '',
      deal.descricao || ''
    ].filter(Boolean).join('\n');

    await createPlanoAcao.mutateAsync({
      cliente_id: deal.cliente_id,
      titulo: `Monitoramento: ${deal.titulo}`,
      descricao,
      prioridade: deal.probabilidade && deal.probabilidade >= 70 ? "alta" : "media",
      data_limite: deal.previsao_fechamento || undefined,
    });

    navigate("/plano-acoes");
  };

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

    // Se está movendo para "perdido", abre o dialog
    if (newStatus === "perdido") {
      setPendingPerdaId(draggedId);
      setMotivoPerda("");
      setDescricaoPerda("");
      setPerdaDialogOpen(true);
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

  const handleConfirmPerda = async () => {
    if (!pendingPerdaId || !motivoPerda) return;

    await updateOportunidade.mutateAsync({
      id: pendingPerdaId,
      data: { 
        status: "perdido",
        motivo_perda: motivoPerda,
        descricao_perda: descricaoPerda || null
      }
    });

    setPerdaDialogOpen(false);
    setPendingPerdaId(null);
    setMotivoPerda("");
    setDescricaoPerda("");
  };

  const handleCancelPerda = () => {
    setPerdaDialogOpen(false);
    setPendingPerdaId(null);
    setMotivoPerda("");
    setDescricaoPerda("");
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={(e) => handleCreatePlanoAcao(e, deal)}
                                    disabled={createPlanoAcao.isPending}
                                  >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Criar Plano de Ação</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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

      {/* Dialog de edição */}
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

      {/* Dialog de motivo de perda */}
      <Dialog open={perdaDialogOpen} onOpenChange={(open) => !open && handleCancelPerda()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Perda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo da Objeção *</Label>
              <Select value={motivoPerda} onValueChange={setMotivoPerda}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_PERDA.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Detalhes</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os detalhes da perda..."
                value={descricaoPerda}
                onChange={(e) => setDescricaoPerda(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelPerda}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPerda} 
              disabled={!motivoPerda || updateOportunidade.isPending}
            >
              {updateOportunidade.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
