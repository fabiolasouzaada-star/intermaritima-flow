import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReunioes } from "@/hooks/useReunioes";
import { useAllAcoesReuniao, type StatusAcaoReuniao, STATUS_ACAO, AREAS_RESPONSAVEL } from "@/hooks/useAcoesReuniao";
import { useAllTarefasAcao } from "@/hooks/useTarefasAcao";
import { AREAS_ENVOLVIDAS, TIPOS_REUNIAO } from "@/hooks/useReunioes";
import { 
  Users, Target, CheckCircle, AlertTriangle, Clock, TrendingUp, 
  Calendar, BarChart3, PieChart, Activity, ArrowUp, ArrowDown
} from "lucide-react";
import { useMemo } from "react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ReunioesPlanoAcaoDashboardProps {
  periodo?: { inicio: Date; fim: Date };
}

const COLORS = {
  nao_iniciada: "hsl(var(--muted-foreground))",
  em_andamento: "hsl(var(--primary))",
  concluida: "hsl(var(--success))",
  atrasada: "hsl(var(--destructive))",
};

export function ReunioesPlanoAcaoDashboard({ periodo }: ReunioesPlanoAcaoDashboardProps) {
  const { data: reunioes } = useReunioes();
  const { data: acoes } = useAllAcoesReuniao();
  const { data: tarefas } = useAllTarefasAcao();

  const stats = useMemo(() => {
    if (!reunioes || !acoes || !tarefas) {
      return {
        totalReunioes: 0,
        totalAcoes: 0,
        acoesNoPrazo: 0,
        percentualNoPrazo: 0,
        percentualConclusao: 0,
        acoesPorArea: [] as { area: string; total: number; atrasadas: number; concluidas: number }[],
        acoesPorStatus: [] as { name: string; value: number; color: string }[],
        tarefasAtrasadas: 0,
        reunioesEsteMes: 0,
        acoesEstaSemana: 0,
        tendenciaConclusao: 0,
        acoesPorPrioridade: { alta: 0, media: 0, baixa: 0 },
        reunioesPorTipo: [] as { name: string; value: number }[],
      };
    }

    let filteredReunioes = reunioes;
    let filteredAcoes = acoes;

    if (periodo) {
      filteredReunioes = reunioes.filter((r) => {
        const data = new Date(r.data_reuniao);
        return data >= periodo.inicio && data <= periodo.fim;
      });

      const reuniaoIds = new Set(filteredReunioes.map((r) => r.id));
      filteredAcoes = acoes.filter((a) => reuniaoIds.has(a.reuniao_id));
    }

    const totalAcoes = filteredAcoes.length;
    const acoesConcluidas = filteredAcoes.filter((a) => a.status === "concluida").length;
    const acoesAtrasadas = filteredAcoes.filter((a) => a.status === "atrasada").length;
    const acoesEmAndamento = filteredAcoes.filter((a) => a.status === "em_andamento").length;
    const acoesNaoIniciadas = filteredAcoes.filter((a) => a.status === "nao_iniciada").length;

    // Ações concluídas no prazo
    const acoesNoPrazo = filteredAcoes.filter((a) => {
      if (a.status !== "concluida" || !a.prazo) return false;
      if (!a.data_conclusao) return true;
      return new Date(a.data_conclusao) <= new Date(a.prazo);
    }).length;

    const percentualNoPrazo = acoesConcluidas > 0 
      ? Math.round((acoesNoPrazo / acoesConcluidas) * 100) 
      : 0;
    
    const percentualConclusao = totalAcoes > 0 
      ? Math.round((acoesConcluidas / totalAcoes) * 100) 
      : 0;

    // Ações por área
    const acoesPorAreaMap = new Map<string, { total: number; atrasadas: number; concluidas: number }>();
    AREAS_ENVOLVIDAS.forEach((area) => {
      acoesPorAreaMap.set(area.value, { total: 0, atrasadas: 0, concluidas: 0 });
    });

    filteredAcoes.forEach((acao) => {
      const current = acoesPorAreaMap.get(acao.area_responsavel) || { total: 0, atrasadas: 0, concluidas: 0 };
      current.total++;
      if (acao.status === "atrasada") current.atrasadas++;
      if (acao.status === "concluida") current.concluidas++;
      acoesPorAreaMap.set(acao.area_responsavel, current);
    });

    const acoesPorArea = AREAS_ENVOLVIDAS
      .map((area) => ({
        area: area.label,
        ...acoesPorAreaMap.get(area.value)!,
      }))
      .filter((a) => a.total > 0)
      .sort((a, b) => b.total - a.total);

    // Ações por status para gráfico de pizza
    const acoesPorStatus = [
      { name: "Não Iniciada", value: acoesNaoIniciadas, color: COLORS.nao_iniciada },
      { name: "Em Andamento", value: acoesEmAndamento, color: COLORS.em_andamento },
      { name: "Concluída", value: acoesConcluidas, color: COLORS.concluida },
      { name: "Atrasada", value: acoesAtrasadas, color: COLORS.atrasada },
    ].filter((s) => s.value > 0);

    // Tarefas atrasadas
    const tarefasAtrasadas = tarefas.filter((t) => t.status === "atrasada").length;

    // Reuniões este mês
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const reunioesEsteMes = filteredReunioes.filter((r) => new Date(r.data_reuniao) >= inicioMes).length;

    // Ações com prazo esta semana
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    const acoesEstaSemana = filteredAcoes.filter((a) => {
      if (!a.prazo) return false;
      const prazo = new Date(a.prazo);
      return prazo >= inicioSemana && prazo <= fimSemana;
    }).length;

    // Ações por prioridade
    const acoesPorPrioridade = {
      alta: filteredAcoes.filter((a) => a.prioridade === "alta" && a.status !== "concluida").length,
      media: filteredAcoes.filter((a) => a.prioridade === "media" && a.status !== "concluida").length,
      baixa: filteredAcoes.filter((a) => a.prioridade === "baixa" && a.status !== "concluida").length,
    };

    // Reuniões por tipo
    const reunioesPorTipoMap = new Map<string, number>();
    filteredReunioes.forEach((r) => {
      const count = reunioesPorTipoMap.get(r.tipo) || 0;
      reunioesPorTipoMap.set(r.tipo, count + 1);
    });
    const reunioesPorTipo = TIPOS_REUNIAO
      .map((t) => ({ name: t.label, value: reunioesPorTipoMap.get(t.value) || 0 }))
      .filter((t) => t.value > 0);

    // Tendência de conclusão (comparação últimos 7 dias vs 7 dias anteriores)
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
    const catorzeDiasAtras = new Date(hoje);
    catorzeDiasAtras.setDate(hoje.getDate() - 14);
    
    const concluidasUltimos7Dias = filteredAcoes.filter((a) => {
      if (!a.data_conclusao) return false;
      const data = new Date(a.data_conclusao);
      return data >= seteDiasAtras && data <= hoje;
    }).length;
    
    const concluidas7a14Dias = filteredAcoes.filter((a) => {
      if (!a.data_conclusao) return false;
      const data = new Date(a.data_conclusao);
      return data >= catorzeDiasAtras && data < seteDiasAtras;
    }).length;
    
    const tendenciaConclusao = concluidas7a14Dias > 0 
      ? Math.round(((concluidasUltimos7Dias - concluidas7a14Dias) / concluidas7a14Dias) * 100)
      : concluidasUltimos7Dias > 0 ? 100 : 0;

    return {
      totalReunioes: filteredReunioes.length,
      totalAcoes,
      acoesNoPrazo,
      percentualNoPrazo,
      percentualConclusao,
      acoesPorArea,
      acoesPorStatus,
      tarefasAtrasadas,
      reunioesEsteMes,
      acoesEstaSemana,
      tendenciaConclusao,
      acoesPorPrioridade,
      reunioesPorTipo,
    };
  }, [reunioes, acoes, tarefas, periodo]);

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reuniões</p>
                <p className="text-2xl font-bold">{stats.totalReunioes}</p>
                <p className="text-xs text-muted-foreground">{stats.reunioesEsteMes} este mês</p>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-2">
            <Calendar className="h-8 w-8 text-primary/10" />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ações Geradas</p>
                <p className="text-2xl font-bold">{stats.totalAcoes}</p>
                <p className="text-xs text-muted-foreground">{stats.acoesEstaSemana} com prazo esta semana</p>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-2">
            <Activity className="h-8 w-8 text-blue-500/10" />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{stats.percentualConclusao}%</p>
                <div className="flex items-center gap-1 text-xs">
                  {stats.tendenciaConclusao >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={stats.tendenciaConclusao >= 0 ? "text-success" : "text-destructive"}>
                    {Math.abs(stats.tendenciaConclusao)}% vs semana anterior
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-2">
            <CheckCircle className="h-8 w-8 text-success/10" />
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Itens Atrasados</p>
                <p className="text-2xl font-bold text-destructive">
                  {(stats.acoesPorStatus.find((s) => s.name === "Atrasada")?.value || 0) + stats.tarefasAtrasadas}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.acoesPorStatus.find((s) => s.name === "Atrasada")?.value || 0} ações, {stats.tarefasAtrasadas} tarefas
                </p>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-2">
            <Clock className="h-8 w-8 text-destructive/10" />
          </div>
        </Card>
      </div>

      {/* Gráficos e detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Status das Ações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.acoesPorStatus.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={stats.acoesPorStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stats.acoesPorStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {stats.acoesPorStatus.map((status) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm">{status.name}</span>
                      </div>
                      <span className="font-medium">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Nenhuma ação registrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prioridades pendentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ações Pendentes por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive text-destructive-foreground">Alta</Badge>
                    <span className="text-sm font-medium">{stats.acoesPorPrioridade.alta}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.totalAcoes > 0 ? Math.round((stats.acoesPorPrioridade.alta / stats.totalAcoes) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalAcoes > 0 ? (stats.acoesPorPrioridade.alta / stats.totalAcoes) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning text-warning-foreground">Média</Badge>
                    <span className="text-sm font-medium">{stats.acoesPorPrioridade.media}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.totalAcoes > 0 ? Math.round((stats.acoesPorPrioridade.media / stats.totalAcoes) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalAcoes > 0 ? (stats.acoesPorPrioridade.media / stats.totalAcoes) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-muted text-muted-foreground">Baixa</Badge>
                    <span className="text-sm font-medium">{stats.acoesPorPrioridade.baixa}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stats.totalAcoes > 0 ? Math.round((stats.acoesPorPrioridade.baixa / stats.totalAcoes) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalAcoes > 0 ? (stats.acoesPorPrioridade.baixa / stats.totalAcoes) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações por Área */}
      {stats.acoesPorArea.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ações por Área Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.acoesPorArea.map((item) => {
                const concluidas = item.concluidas;
                const percentual = item.total > 0 ? Math.round((concluidas / item.total) * 100) : 0;
                
                return (
                  <div key={item.area} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.area}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{item.total} total</span>
                        <span className="text-success">{concluidas} concluídas</span>
                        {item.atrasadas > 0 && (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {item.atrasadas} atrasadas
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Progress value={percentual} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{percentual}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tipos de Reunião */}
      {stats.reunioesPorTipo.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reuniões por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.reunioesPorTipo.map((tipo) => (
                <div 
                  key={tipo.name}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm font-medium">{tipo.name}</span>
                  <Badge variant="secondary">{tipo.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
