import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, User, Building2, Target, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { type Reuniao, TIPOS_REUNIAO, AREAS_ENVOLVIDAS, STATUS_REUNIAO } from "@/hooks/useReunioes";
import { useAcoesReuniao, type AcaoReuniao, STATUS_ACAO, PRIORIDADES_ACAO } from "@/hooks/useAcoesReuniao";
import { useTarefasAcao, type TarefaAcao, STATUS_TAREFA_ACAO } from "@/hooks/useTarefasAcao";
import { AcaoReuniaoForm } from "./AcaoReuniaoForm";
import { TarefaAcaoForm } from "./TarefaAcaoForm";

interface ReuniaoDetailDialogProps {
  reuniao: Reuniao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReuniaoDetailDialog({ reuniao, open, onOpenChange }: ReuniaoDetailDialogProps) {
  const [showAcaoForm, setShowAcaoForm] = useState(false);
  const [showTarefaForm, setShowTarefaForm] = useState<string | null>(null);

  const { data: acoes } = useAcoesReuniao(reuniao?.id);
  const { data: tarefas } = useTarefasAcao();

  // Group actions by client
  const acoesByCliente = useMemo(() => {
    if (!acoes) return new Map<string, AcaoReuniao[]>();
    
    const grouped = new Map<string, AcaoReuniao[]>();
    
    acoes.forEach((acao) => {
      const clienteKey = acao.cliente_id || "sem_cliente";
      const clienteName = acao.clientes?.empresa || "Sem Cliente";
      const key = `${clienteKey}|${clienteName}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(acao);
    });
    
    return grouped;
  }, [acoes]);

  if (!reuniao) return null;

  const tipoLabel = TIPOS_REUNIAO.find((t) => t.value === reuniao.tipo)?.label || reuniao.tipo;
  const areaLabel = AREAS_ENVOLVIDAS.find((a) => a.value === reuniao.area_envolvida)?.label || reuniao.area_envolvida;
  const statusLabel = STATUS_REUNIAO.find((s) => s.value === reuniao.status)?.label || reuniao.status;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizada": return "bg-success/20 text-success";
      case "em_andamento": return "bg-primary/20 text-primary";
      case "cancelada": return "bg-destructive/20 text-destructive";
      default: return "";
    }
  };

  const getTarefasForAcao = (acaoId: string) => {
    return tarefas?.filter((t) => t.acao_id === acaoId) || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes da Reunião
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Informações da Reunião */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Data</span>
                <p className="font-medium">
                  {new Date(reuniao.data_reuniao).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Tipo</span>
                <p className="font-medium">{tipoLabel}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Área</span>
                <p className="font-medium">{areaLabel}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className={getStatusColor(reuniao.status)}>{statusLabel}</Badge>
              </div>
            </div>

            {reuniao.participantes && (
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Participantes
                </span>
                <p className="text-sm">{reuniao.participantes}</p>
              </div>
            )}

            {reuniao.objetivo && (
              <div>
                <span className="text-xs text-muted-foreground">Objetivo</span>
                <p className="text-sm">{reuniao.objetivo}</p>
              </div>
            )}

            {reuniao.resumo && (
              <div>
                <span className="text-xs text-muted-foreground">Resumo</span>
                <p className="text-sm whitespace-pre-wrap">{reuniao.resumo}</p>
              </div>
            )}

            {reuniao.observacoes_estrategicas && (
              <div>
                <span className="text-xs text-muted-foreground">Observações Estratégicas</span>
                <p className="text-sm whitespace-pre-wrap">{reuniao.observacoes_estrategicas}</p>
              </div>
            )}

            {reuniao.proxima_reuniao && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  Próxima reunião: {new Date(reuniao.proxima_reuniao).toLocaleString("pt-BR")}
                </span>
              </div>
            )}

            {/* Plano de Ação */}
            <Tabs defaultValue="acoes" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="acoes" className="flex-1">
                  Plano de Ação ({acoes?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="acoes" className="mt-4 space-y-4">
                {!showAcaoForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAcaoForm(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Ação
                  </Button>
                ) : (
                  <Card className="p-4">
                    <AcaoReuniaoForm
                      reuniaoId={reuniao.id}
                      onSuccess={() => setShowAcaoForm(false)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAcaoForm(false)}
                      className="mt-2 w-full"
                    >
                      Cancelar
                    </Button>
                  </Card>
                )}

                {/* Ações agrupadas por cliente */}
                {Array.from(acoesByCliente.entries()).map(([key, clienteAcoes]) => {
                  const [, clienteName] = key.split("|");
                  
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{clienteName}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {clienteAcoes.length} {clienteAcoes.length === 1 ? "ação" : "ações"}
                        </Badge>
                      </div>

                      {clienteAcoes.map((acao) => {
                        const acaoTarefas = getTarefasForAcao(acao.id);
                        const statusConfig = STATUS_ACAO.find((s) => s.value === acao.status);
                        const prioridadeConfig = PRIORIDADES_ACAO.find((p) => p.value === acao.prioridade);

                        return (
                          <Card key={acao.id} className="p-4 space-y-3 ml-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Target className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{acao.acao}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                                  <Badge className={prioridadeConfig?.color}>{prioridadeConfig?.label}</Badge>
                                  {acao.prazo && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(acao.prazo).toLocaleDateString("pt-BR")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {acao.profiles?.nome && (
                                <span className="text-xs text-muted-foreground">
                                  {acao.profiles.nome}
                                </span>
                              )}
                            </div>

                            {acao.comentarios && (
                              <p className="text-sm text-muted-foreground">{acao.comentarios}</p>
                            )}

                            {/* Tarefas da ação */}
                            <div className="pl-4 border-l-2 border-muted space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Tarefas ({acaoTarefas.length})
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowTarefaForm(showTarefaForm === acao.id ? null : acao.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Tarefa
                                </Button>
                              </div>

                              {showTarefaForm === acao.id && (
                                <Card className="p-3">
                                  <TarefaAcaoForm
                                    acaoId={acao.id}
                                    onSuccess={() => setShowTarefaForm(null)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTarefaForm(null)}
                                    className="mt-2 w-full"
                                  >
                                    Cancelar
                                  </Button>
                                </Card>
                              )}

                              {acaoTarefas.map((tarefa) => {
                                const tarefaStatus = STATUS_TAREFA_ACAO.find((s) => s.value === tarefa.status);
                                return (
                                  <div
                                    key={tarefa.id}
                                    className={`p-2 rounded-lg text-sm ${tarefaStatus?.color}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{tarefa.descricao}</span>
                                      <div className="flex items-center gap-2">
                                        {tarefa.alerta_atraso && (
                                          <AlertTriangle className="h-3 w-3 text-destructive" />
                                        )}
                                        {tarefa.status === "concluida" && (
                                          <CheckCircle className="h-3 w-3 text-success" />
                                        )}
                                      </div>
                                    </div>
                                    {tarefa.profiles?.nome && (
                                      <span className="text-xs text-muted-foreground">
                                        {tarefa.profiles.nome}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })}

                {(!acoes || acoes.length === 0) && !showAcaoForm && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma ação cadastrada para esta reunião
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
