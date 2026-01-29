import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock } from "lucide-react";
import { type AcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO, AREAS_RESPONSAVEL } from "@/hooks/useAcoesReuniao";
import { AcaoReuniaoEditForm } from "./AcaoReuniaoEditForm";
import { TIPOS_REUNIAO } from "@/hooks/useReunioes";

interface AcoesTableViewProps {
  acoes: AcaoReuniao[];
}

export function AcoesTableView({ acoes }: AcoesTableViewProps) {
  const [selectedAcao, setSelectedAcao] = useState<AcaoReuniao | null>(null);

  if (acoes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma ação encontrada
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-[80px]">ID</TableHead>
              <TableHead className="font-semibold">Reunião</TableHead>
              <TableHead className="font-semibold">Ação</TableHead>
              <TableHead className="font-semibold">Área</TableHead>
              <TableHead className="font-semibold">Responsável</TableHead>
              <TableHead className="font-semibold">Prazo</TableHead>
              <TableHead className="font-semibold">Prioridade</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Comentários</TableHead>
              <TableHead className="font-semibold">Conclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {acoes.map((acao) => {
              const statusConfig = STATUS_ACAO.find((s) => s.value === acao.status);
              const prioridadeConfig = PRIORIDADES_ACAO.find((p) => p.value === acao.prioridade);
              const areaConfig = AREAS_RESPONSAVEL.find((a) => a.value === acao.area_responsavel);
              const isOverdue = acao.prazo && new Date(acao.prazo) < new Date() && acao.status !== "concluida";
              
              const tipoReuniao = acao.reunioes?.tipo 
                ? TIPOS_REUNIAO.find((t) => t.value === acao.reunioes?.tipo)?.label || acao.reunioes?.tipo 
                : "";
              const dataReuniao = acao.reunioes?.data_reuniao 
                ? new Date(acao.reunioes.data_reuniao).toLocaleDateString("pt-BR")
                : "";

              return (
                <TableRow
                  key={acao.id}
                  className={`cursor-pointer hover:bg-muted/50 ${isOverdue ? "bg-destructive/5" : ""}`}
                  onClick={() => setSelectedAcao(acao)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {acao.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{tipoReuniao}</span>
                      <span className="text-xs text-muted-foreground">{dataReuniao}</span>
                      {acao.reunioes?.clientes?.empresa && (
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {acao.reunioes.clientes.empresa}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex items-center gap-2">
                      {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
                      <span className="truncate">{acao.acao}</span>
                    </div>
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
                  <TableCell className="max-w-[150px]">
                    <span className="text-xs text-muted-foreground truncate block">
                      {acao.comentarios || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {acao.data_conclusao 
                      ? new Date(acao.data_conclusao).toLocaleDateString("pt-BR")
                      : "-"
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de edição */}
      <Dialog open={!!selectedAcao} onOpenChange={(open) => !open && setSelectedAcao(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ação</DialogTitle>
          </DialogHeader>
          {selectedAcao && (
            <AcaoReuniaoEditForm
              acao={selectedAcao}
              onSuccess={() => setSelectedAcao(null)}
              onCancel={() => setSelectedAcao(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
