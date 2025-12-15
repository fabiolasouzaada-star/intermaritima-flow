import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, User, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useVisitas, type Visita } from "@/hooks/useVisitas";
import { VisitaForm } from "@/components/forms/VisitaForm";
import { VisitasKanban } from "@/components/visitas/VisitasKanban";
import { VisitaDetailDialog } from "@/components/visitas/VisitaDetailDialog";

export default function Visitas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [selectedVisita, setSelectedVisita] = useState<Visita | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: visitas, isLoading } = useVisitas();

  const handleVisitaClick = (visita: Visita) => {
    setSelectedVisita(visita);
    setDetailOpen(true);
  };

  const visitasAgendadas = visitas?.filter(v => v.status === "agendada") || [];
  const visitasRealizadas = visitas?.filter(v => v.status === "realizada") || [];

  const VisitaCard = ({ visita }: { visita: NonNullable<typeof visitas>[0] }) => (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{visita.clientes?.empresa || "Cliente não informado"}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(visita.data_visita).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          <Badge variant={visita.status === "agendada" ? "default" : "secondary"}>
            {visita.status === "agendada" ? "Agendada" : visita.status === "realizada" ? "Realizada" : "Cancelada"}
          </Badge>
        </div>

        <div className="space-y-3">
          {visita.objetivo && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Objetivo</h4>
              <p className="text-sm text-muted-foreground">{visita.objetivo}</p>
            </div>
          )}

          {visita.situacao_atual && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Situação Atual</h4>
              <p className="text-sm text-muted-foreground">{visita.situacao_atual}</p>
            </div>
          )}

          {visita.oportunidades_identificadas && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Oportunidades Identificadas</h4>
              <p className="text-sm text-muted-foreground">{visita.oportunidades_identificadas}</p>
            </div>
          )}

          {visita.dores_percebidas && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Dores Percebidas</h4>
              <p className="text-sm text-muted-foreground">{visita.dores_percebidas}</p>
            </div>
          )}

          {visita.proximos_passos && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Próximos Passos</h4>
              <p className="text-sm text-muted-foreground">{visita.proximos_passos}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Visitas e Pautas</h1>
          <p className="text-muted-foreground">Gestão completa de visitas comerciais</p>
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
                Nova Visita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Visita</DialogTitle>
              </DialogHeader>
              <VisitaForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitasAgendadas.length}</div>
            <p className="text-xs text-muted-foreground">Próximas visitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitasRealizadas.length}</div>
            <p className="text-xs text-muted-foreground">Visitas concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>
      </div>

      <VisitaDetailDialog 
        visita={selectedVisita} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />

      {viewMode === "kanban" ? (
        <VisitasKanban visitas={visitas || []} onVisitaClick={handleVisitaClick} />
      ) : (
        <Tabs defaultValue="agendadas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
            <TabsTrigger value="realizadas">Realizadas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value="agendadas">
            <div className="space-y-4">
              {visitasAgendadas.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">Nenhuma visita agendada</p>
                </Card>
              ) : (
                visitasAgendadas.map((visita) => (
                  <VisitaCard key={visita.id} visita={visita} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="realizadas">
            <div className="space-y-4">
              {visitasRealizadas.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-muted-foreground">Nenhuma visita realizada</p>
                </Card>
              ) : (
                visitasRealizadas.map((visita) => (
                  <VisitaCard key={visita.id} visita={visita} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="todas">
            <div className="space-y-4">
              {visitas?.map((visita) => (
                <VisitaCard key={visita.id} visita={visita} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
