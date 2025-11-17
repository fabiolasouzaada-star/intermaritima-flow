import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Calendar, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockVisitas = [
  {
    id: 1,
    cliente: "ABC Importadora Ltda",
    data: "2025-11-20",
    objetivo: "Apresentar novos serviços de carga projeto",
    situacao: "Cliente interessado em expandir operações",
    oportunidades: ["Carga Projeto", "Logística Integrada"],
    dores: ["Atrasos frequentes", "Falta de visibilidade"],
    acoesCombinadas: [
      { acao: "Enviar proposta detalhada", responsavel: "João Silva", deadline: "2025-11-25", status: "pendente" }
    ],
    proximosPasson: "Follow-up agendado para 30/11",
    responsavel: "João Silva",
    status: "realizada",
  },
  {
    id: 2,
    cliente: "XYZ Exportadora S/A",
    data: "2025-11-22",
    objetivo: "Discutir renovação de contrato",
    situacao: "Cliente satisfeito mas buscando redução de custos",
    oportunidades: ["Renovação Contrato", "Serviços Adicionais"],
    dores: ["Custo elevado", "Necessita otimização"],
    acoesCombinadas: [
      { acao: "Preparar análise de custos", responsavel: "Maria Santos", deadline: "2025-11-28", status: "pendente" }
    ],
    proximosPassos: "Apresentação proposta comercial",
    responsavel: "Maria Santos",
    status: "agendada",
  },
  {
    id: 3,
    cliente: "Tech Solutions Brasil",
    data: "2025-11-18",
    objetivo: "Resolver pendências operacionais",
    situacao: "Cliente com problemas de documentação",
    oportunidades: ["Consultoria especializada"],
    dores: ["Documentação incorreta", "Atrasos alfandegários"],
    acoesCombinadas: [
      { acao: "Implementar checklist de documentos", responsavel: "Pedro Costa", deadline: "2025-11-20", status: "concluida" }
    ],
    proximosPassos: "Monitorar próximas operações",
    responsavel: "Pedro Costa",
    status: "realizada",
  },
];

export default function Visitas() {
  const visitasAgendadas = mockVisitas.filter(v => v.status === "agendada");
  const visitasRealizadas = mockVisitas.filter(v => v.status === "realizada");

  const VisitaCard = ({ visita }: { visita: typeof mockVisitas[0] }) => (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{visita.cliente}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(visita.data).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {visita.responsavel}
              </div>
            </div>
          </div>
          <Badge variant={visita.status === "agendada" ? "default" : "secondary"}>
            {visita.status === "agendada" ? "Agendada" : "Realizada"}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">Objetivo</h4>
            <p className="text-sm text-muted-foreground">{visita.objetivo}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-1">Situação Atual</h4>
            <p className="text-sm text-muted-foreground">{visita.situacao}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Oportunidades Identificadas</h4>
            <div className="flex flex-wrap gap-2">
              {visita.oportunidades.map((op, idx) => (
                <Badge key={idx} variant="outline" className="bg-success/10 text-success border-success/30">
                  {op}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Dores Percebidas</h4>
            <div className="flex flex-wrap gap-2">
              {visita.dores.map((dor, idx) => (
                <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {dor}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Ações Combinadas</h4>
            <div className="space-y-2">
              {visita.acoesCombinadas.map((acao, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{acao.acao}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {acao.responsavel} • Prazo: {new Date(acao.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <Badge variant={acao.status === "concluida" ? "default" : "outline"}>
                    {acao.status === "concluida" ? "Concluída" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-1">Próximos Passos</h4>
            <p className="text-sm text-muted-foreground">{visita.proximosPassos}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            Editar Pauta
          </Button>
          <Button size="sm" className="flex-1">
            Agendar Follow-up
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Visitas e Pautas</h1>
          <p className="text-muted-foreground">Gestão completa de visitas comerciais</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Visita
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{visitasAgendadas.length}</div>
                <div className="text-sm text-muted-foreground">Visitas Agendadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-secondary" />
              <div>
                <div className="text-2xl font-bold">{visitasRealizadas.length}</div>
                <div className="text-sm text-muted-foreground">Visitas Realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{mockVisitas.length}</div>
                <div className="text-sm text-muted-foreground">Total de Visitas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agendadas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
          <TabsTrigger value="realizadas">Realizadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="agendadas" className="space-y-4">
          {visitasAgendadas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Nenhuma visita agendada
              </CardContent>
            </Card>
          ) : (
            visitasAgendadas.map((visita) => <VisitaCard key={visita.id} visita={visita} />)
          )}
        </TabsContent>

        <TabsContent value="realizadas" className="space-y-4">
          {visitasRealizadas.map((visita) => (
            <VisitaCard key={visita.id} visita={visita} />
          ))}
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          {mockVisitas.map((visita) => (
            <VisitaCard key={visita.id} visita={visita} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
