import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Clock, FileText, Users, Target, Calendar } from "lucide-react";
import { useClientes } from "@/hooks/useClientes";
import { useOportunidades } from "@/hooks/useOportunidades";
import { useVisitas } from "@/hooks/useVisitas";
import { useTarefas } from "@/hooks/useTarefas";
import { usePropostas } from "@/hooks/usePropostas";
import { format, isPast, addDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function QualidadeDados() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const { data: oportunidades, isLoading: loadingOportunidades } = useOportunidades();
  const { data: visitas, isLoading: loadingVisitas } = useVisitas();
  const { data: tarefas, isLoading: loadingTarefas } = useTarefas();
  const { data: propostas, isLoading: loadingPropostas } = usePropostas();

  const isLoading = loadingClientes || loadingOportunidades || loadingVisitas || loadingTarefas || loadingPropostas;

  const alertas = useMemo(() => {
    if (isLoading) return { clientes: [], oportunidades: [], propostas: [], followups: [] };

    // Clientes sem campos obrigatórios
    const clientesIncompletos = (clientes || []).filter((c: any) => 
      !c.cnpj || !c.site || !c.segmento || 
      (!c.contatos_cliente || c.contatos_cliente.length === 0)
    );

    // Oportunidades sem valor estimado
    const oportunidadesSemValor = (oportunidades || []).filter(op => 
      !op.valor && op.status !== 'perdido'
    );

    // Oportunidades sem previsão de fechamento
    const oportunidadesSemPrevisao = (oportunidades || []).filter(op => 
      !op.previsao_fechamento && op.status !== 'ganho' && op.status !== 'perdido'
    );

    // Propostas sem validade
    const propostasSemValidade = (propostas || []).filter(p => 
      !p.prazo_validade && p.status === 'enviada'
    );

    // Follow-ups atrasados (tarefas vencidas)
    const tarefasAtrasadas = (tarefas || []).filter(t => 
      t.data_vencimento && 
      isPast(new Date(t.data_vencimento)) && 
      t.status !== 'concluida' && 
      t.status !== 'cancelada'
    );

    // Visitas sem conclusão (agendadas há mais de 7 dias e não realizadas)
    const visitasPendentes = (visitas || []).filter(v => 
      v.status === 'agendada' && 
      isPast(new Date(v.data_visita))
    );

    return {
      clientes: clientesIncompletos,
      oportunidades: [...oportunidadesSemValor, ...oportunidadesSemPrevisao],
      propostas: propostasSemValidade,
      followups: [...tarefasAtrasadas, ...visitasPendentes],
    };
  }, [clientes, oportunidades, propostas, tarefas, visitas, isLoading]);

  const totalAlertas = alertas.clientes.length + alertas.oportunidades.length + 
                       alertas.propostas.length + alertas.followups.length;

  const scoreQualidade = useMemo(() => {
    const totalItems = (clientes?.length || 0) + (oportunidades?.length || 0) + 
                       (propostas?.length || 0) + (tarefas?.length || 0);
    if (totalItems === 0) return 100;
    return Math.max(0, Math.round(100 - (totalAlertas / totalItems * 100)));
  }, [clientes, oportunidades, propostas, tarefas, totalAlertas]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando indicadores...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Qualidade de Dados</h1>
        <p className="text-muted-foreground">Monitoramento e governança dos dados comerciais</p>
      </div>

      {/* Score de Qualidade */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={scoreQualidade >= 80 ? "border-green-500" : scoreQualidade >= 60 ? "border-yellow-500" : "border-red-500"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Qualidade</CardTitle>
            {scoreQualidade >= 80 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : scoreQualidade >= 60 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scoreQualidade}%</div>
            <p className="text-xs text-muted-foreground">
              {scoreQualidade >= 80 ? "Excelente" : scoreQualidade >= 60 ? "Atenção necessária" : "Crítico"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Incompletos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.clientes.length}</div>
            <p className="text-xs text-muted-foreground">Faltam dados obrigatórios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Incompletas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.oportunidades.length}</div>
            <p className="text-xs text-muted-foreground">Sem valor ou previsão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Atrasados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.followups.length}</div>
            <p className="text-xs text-muted-foreground">Tarefas e visitas pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes dos Alertas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Clientes Incompletos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes com Dados Incompletos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alertas.clientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Todos os clientes estão completos ✓
                </p>
              ) : (
                alertas.clientes.slice(0, 10).map((cliente: any) => (
                  <div key={cliente.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="font-medium truncate">{cliente.empresa}</span>
                    <div className="flex gap-1">
                      {!cliente.cnpj && <Badge variant="outline" className="text-xs">CNPJ</Badge>}
                      {!cliente.site && <Badge variant="outline" className="text-xs">Site</Badge>}
                      {(!cliente.contatos_cliente || cliente.contatos_cliente.length === 0) && 
                        <Badge variant="outline" className="text-xs">Contato</Badge>}
                    </div>
                  </div>
                ))
              )}
              {alertas.clientes.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{alertas.clientes.length - 10} clientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Oportunidades Incompletas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Oportunidades sem Valor ou Previsão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alertas.oportunidades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Todas as oportunidades estão completas ✓
                </p>
              ) : (
                alertas.oportunidades.slice(0, 10).map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="truncate">
                      <span className="font-medium">{op.titulo}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {op.clientes?.empresa}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {!op.valor && <Badge variant="destructive" className="text-xs">Sem Valor</Badge>}
                      {!op.previsao_fechamento && <Badge variant="outline" className="text-xs">Sem Previsão</Badge>}
                    </div>
                  </div>
                ))
              )}
              {alertas.oportunidades.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{alertas.oportunidades.length - 10} oportunidades
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Atrasados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Follow-ups Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alertas.followups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum follow-up atrasado ✓
                </p>
              ) : (
                alertas.followups.slice(0, 10).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="truncate">
                      <span className="font-medium">{item.titulo || item.objetivo || "Sem título"}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {item.data_vencimento 
                          ? format(new Date(item.data_vencimento), "dd/MM", { locale: ptBR })
                          : item.data_visita
                          ? format(new Date(item.data_visita), "dd/MM", { locale: ptBR })
                          : ""
                        }
                      </span>
                    </div>
                    <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                  </div>
                ))
              )}
              {alertas.followups.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{alertas.followups.length - 10} itens
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Propostas sem Validade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Propostas sem Data de Validade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alertas.propostas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Todas as propostas têm validade definida ✓
                </p>
              ) : (
                alertas.propostas.slice(0, 10).map((proposta) => (
                  <div key={proposta.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="truncate">
                      <span className="font-medium">{proposta.numero_proposta}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {proposta.clientes?.empresa}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">Sem Validade</Badge>
                  </div>
                ))
              )}
              {alertas.propostas.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{alertas.propostas.length - 10} propostas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
