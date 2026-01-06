import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Oportunidade } from "@/hooks/useOportunidades";

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {oportunidades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
