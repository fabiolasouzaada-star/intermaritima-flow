import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import { type AcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO, AREAS_RESPONSAVEL } from "@/hooks/useAcoesReuniao";

interface AcoesTableViewProps {
  acoes: AcaoReuniao[];
  onAcaoClick?: (acao: AcaoReuniao) => void;
}

export function AcoesTableView({ acoes, onAcaoClick }: AcoesTableViewProps) {
  if (acoes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma ação encontrada
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Ação</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Área</TableHead>
            <TableHead className="font-semibold">Responsável</TableHead>
            <TableHead className="font-semibold">Prazo</TableHead>
            <TableHead className="font-semibold">Prioridade</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Impacto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {acoes.map((acao) => {
            const statusConfig = STATUS_ACAO.find((s) => s.value === acao.status);
            const prioridadeConfig = PRIORIDADES_ACAO.find((p) => p.value === acao.prioridade);
            const areaConfig = AREAS_RESPONSAVEL.find((a) => a.value === acao.area_responsavel);
            const isOverdue = acao.prazo && new Date(acao.prazo) < new Date() && acao.status !== "concluida";

            const impactoLabels: Record<string, string> = {
              financeiro: "Financeiro",
              operacional: "Operacional",
              relacionamento_cliente: "Relacionamento",
              compliance: "Compliance",
            };

            return (
              <TableRow
                key={acao.id}
                className={`cursor-pointer hover:bg-muted/50 ${isOverdue ? "bg-destructive/5" : ""}`}
                onClick={() => onAcaoClick?.(acao)}
              >
                <TableCell className="font-medium max-w-[200px]">
                  <div className="flex items-center gap-2">
                    {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                    <span className="truncate">{acao.acao}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {acao.clientes?.empresa || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {areaConfig?.label || acao.area_responsavel}
                  </Badge>
                </TableCell>
                <TableCell>
                  {acao.profiles?.nome || "-"}
                </TableCell>
                <TableCell>
                  {acao.prazo ? (
                    <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                      <Clock className="h-3 w-3" />
                      {new Date(acao.prazo).toLocaleDateString("pt-BR")}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <Badge className={prioridadeConfig?.color}>
                    {prioridadeConfig?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig?.color}>
                    {statusConfig?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {acao.impacto ? impactoLabels[acao.impacto] || acao.impacto : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
