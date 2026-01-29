import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReunioes } from "@/hooks/useReunioes";
import { useAllAcoesReuniao, type StatusAcaoReuniao } from "@/hooks/useAcoesReuniao";
import { useAllTarefasAcao } from "@/hooks/useTarefasAcao";
import { AREAS_ENVOLVIDAS } from "@/hooks/useReunioes";
import { Users, Target, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface ReunioesPlanoAcaoDashboardProps {
  periodo?: { inicio: Date; fim: Date };
}

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
        acoesPorArea: [] as { area: string; total: number; atrasadas: number }[],
        tarefasAtrasadas: 0,
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

    // Ações concluídas no prazo (status concluída e data_conclusao <= prazo)
    const acoesNoPrazo = filteredAcoes.filter((a) => {
      if (a.status !== "concluida" || !a.prazo) return false;
      if (!a.data_conclusao) return true;
      return new Date(a.data_conclusao) <= new Date(a.prazo);
    }).length;

    const percentualNoPrazo = acoesConcluidas > 0 
      ? Math.round((acoesNoPrazo / acoesConcluidas) * 100) 
      : 0;

    // Ações por área
    const acoesPorAreaMap = new Map<string, { total: number; atrasadas: number }>();
    AREAS_ENVOLVIDAS.forEach((area) => {
      acoesPorAreaMap.set(area.value, { total: 0, atrasadas: 0 });
    });

    filteredAcoes.forEach((acao) => {
      const current = acoesPorAreaMap.get(acao.area_responsavel) || { total: 0, atrasadas: 0 };
      current.total++;
      if (acao.status === "atrasada") current.atrasadas++;
      acoesPorAreaMap.set(acao.area_responsavel, current);
    });

    const acoesPorArea = AREAS_ENVOLVIDAS
      .map((area) => ({
        area: area.label,
        ...acoesPorAreaMap.get(area.value)!,
      }))
      .filter((a) => a.total > 0)
      .sort((a, b) => b.atrasadas - a.atrasadas);

    const tarefasAtrasadas = tarefas.filter((t) => t.status === "atrasada").length;

    return {
      totalReunioes: filteredReunioes.length,
      totalAcoes,
      acoesNoPrazo,
      percentualNoPrazo,
      acoesPorArea,
      tarefasAtrasadas,
    };
  }, [reunioes, acoes, tarefas, periodo]);

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reuniões</p>
                <p className="text-2xl font-bold">{stats.totalReunioes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ações Geradas</p>
                <p className="text-2xl font-bold">{stats.totalAcoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas no Prazo</p>
                <p className="text-2xl font-bold">{stats.percentualNoPrazo}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Atrasadas</p>
                <p className="text-2xl font-bold">{stats.tarefasAtrasadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações em atraso por área */}
      {stats.acoesPorArea.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ações por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.acoesPorArea.map((item) => (
                <div key={item.area} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.area}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {item.total} total
                    </span>
                    {item.atrasadas > 0 && (
                      <span className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {item.atrasadas} atrasada(s)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
