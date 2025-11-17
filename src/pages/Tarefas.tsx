import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockTarefas = [
  {
    id: 1,
    titulo: "Follow-up com ABC Importadora",
    cliente: "ABC Importadora Ltda",
    prazo: "2025-11-20",
    prioridade: "Alta",
    status: "pendente",
    responsavel: "João Silva",
  },
  {
    id: 2,
    titulo: "Enviar proposta renovação",
    cliente: "XYZ Exportadora S/A",
    prazo: "2025-11-18",
    prioridade: "Alta",
    status: "atrasada",
    responsavel: "Maria Santos",
  },
  {
    id: 3,
    titulo: "Agendar visita técnica",
    cliente: "Tech Solutions Brasil",
    prazo: "2025-11-22",
    prioridade: "Média",
    status: "pendente",
    responsavel: "Pedro Costa",
  },
  {
    id: 4,
    titulo: "Revisar contrato",
    cliente: "Logística Moderna",
    prazo: "2025-11-25",
    prioridade: "Baixa",
    status: "pendente",
    responsavel: "Ana Paula",
  },
  {
    id: 5,
    titulo: "Preparar apresentação",
    cliente: "Comercial Sul América",
    prazo: "2025-11-19",
    prioridade: "Alta",
    status: "concluida",
    responsavel: "Carlos Mendes",
  },
];

export default function Tarefas() {
  const tarefasHoje = mockTarefas.filter(
    (t) => new Date(t.prazo).toDateString() === new Date().toDateString() && t.status === "pendente"
  );
  const tarefasAtrasadas = mockTarefas.filter((t) => t.status === "atrasada");
  const tarefasSemana = mockTarefas.filter((t) => {
    const prazo = new Date(t.prazo);
    const hoje = new Date();
    const umaSemana = new Date();
    umaSemana.setDate(hoje.getDate() + 7);
    return prazo >= hoje && prazo <= umaSemana && t.status === "pendente";
  });

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string }> = {
      Alta: { className: "bg-destructive text-destructive-foreground" },
      Média: { className: "bg-warning text-warning-foreground" },
      Baixa: { className: "bg-muted text-muted-foreground" },
    };
    const style = config[prioridade] || config.Média;
    return <Badge className={style.className}>{prioridade}</Badge>;
  };

  const getTarefasList = (tarefas: typeof mockTarefas) => (
    <div className="space-y-3">
      {tarefas.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhuma tarefa</p>
      ) : (
        tarefas.map((tarefa) => (
          <Card key={tarefa.id} className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox className="mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{tarefa.titulo}</h3>
                  {getPrioridadeBadge(tarefa.prioridade)}
                </div>
                <div className="text-sm text-muted-foreground">{tarefa.cliente}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{tarefa.responsavel}</span>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas Comerciais</h1>
          <p className="text-muted-foreground">Gestão de tarefas e follow-ups</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{tarefasHoje.length}</div>
                <div className="text-sm text-muted-foreground">Tarefas Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{tarefasAtrasadas.length}</div>
                <div className="text-sm text-muted-foreground">Atrasadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{tarefasSemana.length}</div>
                <div className="text-sm text-muted-foreground">Esta Semana</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hoje" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="atrasadas">Atrasadas</TabsTrigger>
          <TabsTrigger value="semana">Esta Semana</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas de Hoje</CardTitle>
            </CardHeader>
            <CardContent>{getTarefasList(tarefasHoje)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atrasadas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>{getTarefasList(tarefasAtrasadas)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semana" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas desta Semana</CardTitle>
            </CardHeader>
            <CardContent>{getTarefasList(tarefasSemana)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Tarefas</CardTitle>
            </CardHeader>
            <CardContent>{getTarefasList(mockTarefas.filter(t => t.status !== "concluida"))}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
