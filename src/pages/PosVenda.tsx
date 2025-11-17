import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockPosVenda = [
  {
    id: 1,
    cliente: "ABC Importadora Ltda",
    feedback: "Muito satisfeito com os serviços",
    sla: 99.5,
    ocorrencias: [
      { tipo: "documento", descricao: "Faltou invoice original", status: "resolvida", data: "2025-11-10" }
    ],
    pontosFortes: ["Agilidade", "Comunicação clara"],
    pontosMelhoria: ["Notificações mais frequentes"],
    risco: "baixo",
    acoes: [],
  },
  {
    id: 2,
    cliente: "XYZ Exportadora S/A",
    feedback: "Satisfeito mas preocupado com custos",
    sla: 96.8,
    ocorrencias: [
      { tipo: "atraso", descricao: "Atraso de 2 dias na entrega", status: "resolvida", data: "2025-11-12" },
      { tipo: "divergencia", descricao: "Divergência no peso declarado", status: "pendente", data: "2025-11-15" }
    ],
    pontosFortes: ["Expertise técnica"],
    pontosMelhoria: ["Reduzir custos", "Melhorar prazo"],
    risco: "medio",
    acoes: [
      { acao: "Reunião para revisar tarifas", responsavel: "Maria Santos", prazo: "2025-11-25" }
    ],
  },
  {
    id: 3,
    cliente: "Tech Solutions Brasil",
    feedback: "Insatisfeito com documentação",
    sla: 92.3,
    ocorrencias: [
      { tipo: "documento", descricao: "Erros recorrentes em documentos", status: "pendente", data: "2025-11-14" },
      { tipo: "atraso", descricao: "Atraso alfandegário", status: "pendente", data: "2025-11-16" }
    ],
    pontosFortes: [],
    pontosMelhoria: ["Qualidade documental", "Treinamento equipe", "Processos mais claros"],
    risco: "alto",
    acoes: [
      { acao: "Implementar checklist rigoroso", responsavel: "Pedro Costa", prazo: "2025-11-20" },
      { acao: "Reunião de alinhamento", responsavel: "Pedro Costa", prazo: "2025-11-22" }
    ],
  },
];

export default function PosVenda() {
  const clientesAltoRisco = mockPosVenda.filter(c => c.risco === "alto").length;
  const clientesMedioRisco = mockPosVenda.filter(c => c.risco === "medio").length;
  const slaMedia = (mockPosVenda.reduce((acc, c) => acc + c.sla, 0) / mockPosVenda.length).toFixed(1);

  const getRiscoBadge = (risco: string) => {
    const config: Record<string, { variant: "default" | "destructive" | "outline", label: string }> = {
      alto: { variant: "destructive", label: "Alto Risco" },
      medio: { variant: "outline", label: "Médio Risco" },
      baixo: { variant: "default", label: "Baixo Risco" },
    };
    const item = config[risco] || config.baixo;
    return <Badge variant={item.variant} className={risco === "medio" ? "border-warning text-warning" : ""}>{item.label}</Badge>;
  };

  const ClienteCard = ({ cliente }: { cliente: typeof mockPosVenda[0] }) => (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{cliente.cliente}</h3>
            <div className="flex items-center gap-2 mt-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{cliente.feedback}</span>
            </div>
          </div>
          {getRiscoBadge(cliente.risco)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">SLA de Entrega</span>
            <span className="font-semibold">{cliente.sla}%</span>
          </div>
          <Progress value={cliente.sla} className="h-2" />
        </div>

        {cliente.ocorrencias.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ocorrências ({cliente.ocorrencias.length})
            </h4>
            <div className="space-y-2">
              {cliente.ocorrencias.map((ocorrencia, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{ocorrencia.tipo}</Badge>
                      {ocorrencia.status === "resolvida" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="text-sm">{ocorrencia.descricao}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(ocorrencia.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cliente.pontosFortes.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Pontos Fortes
            </h4>
            <div className="flex flex-wrap gap-2">
              {cliente.pontosFortes.map((ponto, idx) => (
                <Badge key={idx} variant="outline" className="bg-success/10 text-success border-success/30">
                  {ponto}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cliente.pontosMelhoria.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Pontos de Melhoria</h4>
            <div className="flex flex-wrap gap-2">
              {cliente.pontosMelhoria.map((ponto, idx) => (
                <Badge key={idx} variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  {ponto}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cliente.acoes.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Ações de Retenção</h4>
            <div className="space-y-2">
              {cliente.acoes.map((acao, idx) => (
                <div key={idx} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="text-sm font-medium">{acao.acao}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {acao.responsavel} • Prazo: {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            Editar Feedback
          </Button>
          <Button size="sm" className="flex-1">
            Agendar Reunião
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pós-Venda e Retenção</h1>
        <p className="text-muted-foreground">Acompanhamento de satisfação e qualidade</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">{slaMedia}%</div>
                <div className="text-sm text-muted-foreground">SLA Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{clientesAltoRisco}</div>
                <div className="text-sm text-muted-foreground">Alto Risco</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{clientesMedioRisco}</div>
                <div className="text-sm text-muted-foreground">Médio Risco</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{mockPosVenda.length}</div>
                <div className="text-sm text-muted-foreground">Em Acompanhamento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="alto-risco">Alto Risco</TabsTrigger>
          <TabsTrigger value="medio-risco">Médio Risco</TabsTrigger>
          <TabsTrigger value="baixo-risco">Baixo Risco</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {mockPosVenda.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </TabsContent>

        <TabsContent value="alto-risco" className="space-y-4">
          {mockPosVenda.filter(c => c.risco === "alto").map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </TabsContent>

        <TabsContent value="medio-risco" className="space-y-4">
          {mockPosVenda.filter(c => c.risco === "medio").map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </TabsContent>

        <TabsContent value="baixo-risco" className="space-y-4">
          {mockPosVenda.filter(c => c.risco === "baixo").map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
