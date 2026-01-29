import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, Calendar, Building2, User, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { type AcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO, AREAS_RESPONSAVEL } from "@/hooks/useAcoesReuniao";
import { AcaoReuniaoEditForm } from "./AcaoReuniaoEditForm";
import { TIPOS_REUNIAO } from "@/hooks/useReunioes";
import { Button } from "@/components/ui/button";

interface AcoesTableViewProps {
  acoes: AcaoReuniao[];
}

type SortField = "prazo" | "prioridade" | "status" | "area_responsavel" | "data_conclusao";
type SortDirection = "asc" | "desc";

export function AcoesTableView({ acoes }: AcoesTableViewProps) {
  const [selectedAcao, setSelectedAcao] = useState<AcaoReuniao | null>(null);
  const [sortField, setSortField] = useState<SortField>("prazo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedAcoes = [...acoes].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "prazo":
        const prazoA = a.prazo ? new Date(a.prazo).getTime() : Infinity;
        const prazoB = b.prazo ? new Date(b.prazo).getTime() : Infinity;
        comparison = prazoA - prazoB;
        break;
      case "prioridade":
        const prioridadeOrder = { alta: 0, media: 1, baixa: 2 };
        comparison = (prioridadeOrder[a.prioridade] || 2) - (prioridadeOrder[b.prioridade] || 2);
        break;
      case "status":
        const statusOrder = { atrasada: 0, em_andamento: 1, nao_iniciada: 2, concluida: 3 };
        comparison = (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
        break;
      case "area_responsavel":
        comparison = a.area_responsavel.localeCompare(b.area_responsavel);
        break;
      case "data_conclusao":
        const concA = a.data_conclusao ? new Date(a.data_conclusao).getTime() : Infinity;
        const concB = b.data_conclusao ? new Date(b.data_conclusao).getTime() : Infinity;
        comparison = concA - concB;
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  if (acoes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma ação encontrada
      </div>
    );
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 -ml-3 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={`ml-1 h-3 w-3 ${sortField === field ? "text-primary" : "text-muted-foreground"}`} />
    </Button>
  );

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm">
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold w-[70px] text-xs">ID</TableHead>
                  <TableHead className="font-semibold w-[160px] text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Reunião
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold min-w-[200px] text-xs">Ação</TableHead>
                  <TableHead className="font-semibold w-[120px] text-xs">
                    <SortableHeader field="area_responsavel">Área</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold w-[130px] text-xs">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Responsável
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold w-[100px] text-xs">
                    <SortableHeader field="prazo">Prazo</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold w-[90px] text-xs">
                    <SortableHeader field="prioridade">Prioridade</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold w-[110px] text-xs">
                    <SortableHeader field="status">Status</SortableHeader>
                  </TableHead>
                  <TableHead className="font-semibold min-w-[150px] text-xs">Comentários</TableHead>
                  <TableHead className="font-semibold w-[100px] text-xs">
                    <SortableHeader field="data_conclusao">Conclusão</SortableHeader>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAcoes.map((acao, index) => {
                  const statusConfig = STATUS_ACAO.find((s) => s.value === acao.status);
                  const prioridadeConfig = PRIORIDADES_ACAO.find((p) => p.value === acao.prioridade);
                  const areaConfig = AREAS_RESPONSAVEL.find((a) => a.value === acao.area_responsavel);
                  const isOverdue = acao.prazo && new Date(acao.prazo) < new Date() && acao.status !== "concluida";
                  const isConcluida = acao.status === "concluida";
                  
                  const tipoReuniao = acao.reunioes?.tipo 
                    ? TIPOS_REUNIAO.find((t) => t.value === acao.reunioes?.tipo)?.label || acao.reunioes?.tipo 
                    : "";
                  const dataReuniao = acao.reunioes?.data_reuniao 
                    ? new Date(acao.reunioes.data_reuniao).toLocaleDateString("pt-BR")
                    : "";

                  return (
                    <TableRow
                      key={acao.id}
                      className={`
                        cursor-pointer transition-colors
                        ${isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/50"}
                        ${isConcluida ? "opacity-70" : ""}
                        ${index % 2 === 0 ? "" : "bg-muted/20"}
                      `}
                      onClick={() => setSelectedAcao(acao)}
                    >
                      <TableCell className="font-mono text-[10px] text-muted-foreground py-3">
                        {acao.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-primary">{tipoReuniao}</span>
                          <span className="text-[10px] text-muted-foreground">{dataReuniao}</span>
                          {acao.reunioes?.clientes?.empresa && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-2.5 w-2.5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {acao.reunioes.clientes.empresa}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-start gap-2">
                          {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />}
                          {isConcluida && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />}
                          <span className={`text-sm font-medium ${isConcluida ? "line-through" : ""}`}>
                            {acao.acao}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {areaConfig?.label || acao.area_responsavel}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs">
                          {acao.profiles?.nome || <span className="text-muted-foreground">-</span>}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {acao.prazo ? (
                          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : ""}`}>
                            <Clock className="h-3 w-3" />
                            {new Date(acao.prazo).toLocaleDateString("pt-BR")}
                          </div>
                        ) : <span className="text-muted-foreground text-xs">-</span>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={`${prioridadeConfig?.color} text-[10px]`}>
                          {prioridadeConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={`${statusConfig?.color} text-[10px]`}>
                          {statusConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 max-w-[200px]">
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {acao.comentarios || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        {acao.data_conclusao ? (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Date(acao.data_conclusao).toLocaleDateString("pt-BR")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        
        {/* Footer com total */}
        <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Total: {acoes.length} {acoes.length === 1 ? "ação" : "ações"}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              {acoes.filter(a => a.prazo && new Date(a.prazo) < new Date() && a.status !== "concluida").length} atrasadas
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              {acoes.filter(a => a.status === "concluida").length} concluídas
            </span>
          </div>
        </div>
      </div>

      {/* Dialog de edição */}
      <Dialog open={!!selectedAcao} onOpenChange={(open) => !open && setSelectedAcao(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
