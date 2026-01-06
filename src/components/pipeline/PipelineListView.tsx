import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import { Oportunidade } from "@/hooks/useOportunidades";
import { useCreatePlanoAcao } from "@/hooks/usePlanoAcoes";

interface PipelineListViewProps {
  oportunidades: Oportunidade[];
  onCardClick?: (oportunidade: Oportunidade) => void;
}

const statusMap: Record<string, string> = {
  qualificacao: "Qualificação",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechamento: "Fechamento",
  ganho: "Ganho",
  perdido: "Perdido",
};

const statusColors: Record<string, string> = {
  qualificacao: "bg-blue-100 text-blue-800",
  proposta: "bg-purple-100 text-purple-800",
  negociacao: "bg-yellow-100 text-yellow-800",
  fechamento: "bg-orange-100 text-orange-800",
  ganho: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
};

export function PipelineListView({ oportunidades, onCardClick }: PipelineListViewProps) {
  const navigate = useNavigate();
  const createPlanoAcao = useCreatePlanoAcao();

  const handleCreatePlanoAcao = async (e: React.MouseEvent, op: Oportunidade) => {
    e.stopPropagation();
    
    const valorFormatado = op.valor 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(op.valor)
      : '';
    
    const descricao = [
      `Oportunidade: ${op.titulo}`,
      valorFormatado ? `Valor: ${valorFormatado}` : '',
      op.probabilidade ? `Probabilidade: ${op.probabilidade}%` : '',
      op.previsao_fechamento ? `Previsão: ${new Date(op.previsao_fechamento).toLocaleDateString('pt-BR')}` : '',
      op.descricao || ''
    ].filter(Boolean).join('\n');

    await createPlanoAcao.mutateAsync({
      cliente_id: op.cliente_id,
      titulo: `Monitoramento: ${op.titulo}`,
      descricao,
      prioridade: op.probabilidade && op.probabilidade >= 70 ? "alta" : "media",
      data_limite: op.previsao_fechamento || undefined,
    });

    navigate("/plano-acoes");
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Probabilidade</TableHead>
            <TableHead>Previsão Fechamento</TableHead>
            <TableHead className="w-[60px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oportunidades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma oportunidade encontrada
              </TableCell>
            </TableRow>
          ) : (
            oportunidades.map((op) => (
              <TableRow 
                key={op.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCardClick?.(op)}
              >
                <TableCell className="font-medium">{op.titulo}</TableCell>
                <TableCell>{op.clientes?.empresa || "—"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[op.status] || "bg-gray-100 text-gray-800"}>
                    {statusMap[op.status] || op.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {op.valor
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(op.valor)
                    : "—"}
                </TableCell>
                <TableCell className="text-center">
                  {op.probabilidade ? `${op.probabilidade}%` : "—"}
                </TableCell>
                <TableCell>
                  {op.previsao_fechamento
                    ? format(new Date(op.previsao_fechamento), "dd/MM/yyyy", { locale: ptBR })
                    : "—"}
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleCreatePlanoAcao(e, op)}
                          disabled={createPlanoAcao.isPending}
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Criar Plano de Ação</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
