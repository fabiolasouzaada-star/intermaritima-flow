import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Clock, CheckCircle2, LayoutGrid, List, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTarefas, useUpdateTarefa } from "@/hooks/useTarefas";
import { TarefaForm } from "@/components/forms/TarefaForm";
import { KanbanBoard } from "@/components/tarefas/KanbanBoard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Tarefas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const { data: tarefas, isLoading } = useTarefas();
  const updateTarefa = useUpdateTarefa();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const tarefasHoje = tarefas?.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    const vencimento = new Date(t.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento.getTime() === hoje.getTime();
  }) || [];

  const tarefasAtrasadas = tarefas?.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    const vencimento = new Date(t.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  }) || [];

  const tarefasSemana = tarefas?.filter((t) => {
    if (!t.data_vencimento || t.status === "concluida") return false;
    const vencimento = new Date(t.data_vencimento);
    vencimento.setHours(0, 0, 0, 0);
    const umaSemana = new Date(hoje);
    umaSemana.setDate(hoje.getDate() + 7);
    return vencimento >= hoje && vencimento <= umaSemana;
  }) || [];

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { className: string }> = {
      urgente: { className: "bg-destructive text-destructive-foreground" },
      alta: { className: "bg-destructive text-destructive-foreground" },
      media: { className: "bg-warning text-warning-foreground" },
      baixa: { className: "bg-muted text-muted-foreground" },
    };
    const style = config[prioridade] || config.media;
    const label = prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
    return <Badge className={style.className}>{label}</Badge>;
  };

  const handleToggleTarefa = async (tarefaId: string, currentStatus: string) => {
    const newStatus = currentStatus === "concluida" ? "pendente" : "concluida";
    await updateTarefa.mutateAsync({ id: tarefaId, data: { status: newStatus } });
  };

  const getTarefasList = (tarefasList: typeof tarefas) => (
    <div className="space-y-3">
      {!tarefasList || tarefasList.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhuma tarefa</p>
      ) : (
        tarefasList.map((tarefa) => {
          const responsavelNome = tarefa.responsavel_nome;
          return (
            <Card key={tarefa.id} className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox 
                  className="mt-1" 
                  checked={tarefa.status === "concluida"}
                  onCheckedChange={() => handleToggleTarefa(tarefa.id, tarefa.status)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tarefa.titulo}</h3>
                    <div className="flex items-center gap-2">
                      {getPrioridadeBadge(tarefa.prioridade)}
                    </div>
                  </div>
                  {tarefa.descricao && (
                    <p className="text-sm text-muted-foreground">{tarefa.descricao}</p>
                  )}
                  {tarefa.clientes && (
                    <Badge variant="outline" className="text-xs">
                      {tarefa.clientes.empresa}
                    </Badge>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {tarefa.data_vencimento && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(tarefa.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {responsavelNome ? (
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] bg-primary/10">
                            {getInitials(responsavelNome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {responsavelNome}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Sem responsável</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tarefas Comerciais</h1>
          <p className="text-muted-foreground">Gerencie suas atividades diárias</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <TarefaForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
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

      {viewMode === "kanban" ? (
        <KanbanBoard tarefas={tarefas || []} />
      ) : (
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

          <TabsContent value="todas">
            {getTarefasList(tarefas?.filter(t => t.status !== "concluida"))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
