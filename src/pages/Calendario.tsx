import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, FileText, Clock, AlertCircle, MapPin } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useVisitas } from "@/hooks/useVisitas";
import { useTarefas } from "@/hooks/useTarefas";
import { format, isToday, isSameDay, addDays, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: visitas, isLoading: isLoadingVisitas } = useVisitas();
  const { data: tarefas, isLoading: isLoadingTarefas } = useTarefas();
  const navigate = useNavigate();

  // Alertas para visitas do dia
  const visitasHoje = useMemo(() => {
    if (!visitas) return [];
    return visitas.filter(v => 
      isToday(new Date(v.data_visita)) && v.status === "agendada"
    );
  }, [visitas]);

  // Mostrar alerta de visitas do dia ao carregar
  useEffect(() => {
    if (visitasHoje.length > 0) {
      toast.info(
        `Você tem ${visitasHoje.length} visita(s) agendada(s) para hoje!`,
        { duration: 5000 }
      );
    }
  }, [visitasHoje.length]);

  // Eventos do dia selecionado
  const eventosDodia = useMemo(() => {
    const eventos: Array<{
      id: string;
      tipo: "visita" | "tarefa";
      titulo: string;
      cliente?: string;
      data: Date;
      hora: string;
      status: string;
    }> = [];

    if (visitas && date) {
      visitas.forEach(v => {
        const dataVisita = new Date(v.data_visita);
        if (isSameDay(dataVisita, date)) {
          eventos.push({
            id: v.id,
            tipo: "visita",
            titulo: v.objetivo || "Visita",
            cliente: v.clientes?.empresa,
            data: dataVisita,
            hora: format(dataVisita, "HH:mm"),
            status: v.status,
          });
        }
      });
    }

    if (tarefas && date) {
      tarefas.forEach(t => {
        if (t.data_vencimento && isSameDay(new Date(t.data_vencimento), date)) {
          eventos.push({
            id: t.id,
            tipo: "tarefa",
            titulo: t.titulo,
            cliente: undefined,
            data: new Date(t.data_vencimento),
            hora: "00:00",
            status: t.status,
          });
        }
      });
    }

    return eventos.sort((a, b) => a.hora.localeCompare(b.hora));
  }, [visitas, tarefas, date]);

  // Próximos 7 dias
  const proximosEventos = useMemo(() => {
    const eventos: Array<{
      id: string;
      tipo: "visita" | "tarefa";
      titulo: string;
      cliente?: string;
      data: Date;
      status: string;
    }> = [];

    const hoje = startOfDay(new Date());
    const limiteDias = addDays(hoje, 7);

    if (visitas) {
      visitas.forEach(v => {
        const dataVisita = new Date(v.data_visita);
        if (dataVisita >= hoje && dataVisita <= limiteDias && v.status === "agendada") {
          eventos.push({
            id: v.id,
            tipo: "visita",
            titulo: v.objetivo || "Visita",
            cliente: v.clientes?.empresa,
            data: dataVisita,
            status: v.status,
          });
        }
      });
    }

    if (tarefas) {
      tarefas.forEach(t => {
        if (t.data_vencimento) {
          const dataTarefa = new Date(t.data_vencimento);
          if (dataTarefa >= hoje && dataTarefa <= limiteDias && t.status === "pendente") {
            eventos.push({
              id: t.id,
              tipo: "tarefa",
              titulo: t.titulo,
              cliente: undefined,
              data: dataTarefa,
              status: t.status,
            });
          }
        }
      });
    }

    return eventos.sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [visitas, tarefas]);

  // Dias com eventos para marcar no calendário
  const diasComEventos = useMemo(() => {
    const dias: Date[] = [];
    
    if (visitas) {
      visitas.forEach(v => {
        dias.push(new Date(v.data_visita));
      });
    }

    if (tarefas) {
      tarefas.forEach(t => {
        if (t.data_vencimento) {
          dias.push(new Date(t.data_vencimento));
        }
      });
    }

    return dias;
  }, [visitas, tarefas]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "visita":
        return <MapPin className="h-4 w-4" />;
      case "tarefa":
        return <Clock className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getTipoBadge = (tipo: string, status: string) => {
    if (tipo === "visita") {
      const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
        agendada: { variant: "default", label: "Agendada" },
        realizada: { variant: "secondary", label: "Realizada" },
        cancelada: { variant: "destructive", label: "Cancelada" },
      };
      const item = config[status] || config.agendada;
      return <Badge variant={item.variant}>{item.label}</Badge>;
    }
    
    return <Badge variant="outline">Tarefa</Badge>;
  };

  const isLoading = isLoadingVisitas || isLoadingTarefas;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Calendário Comercial</h1>
        <p className="text-muted-foreground text-sm md:text-base">Agenda de visitas, reuniões e compromissos</p>
      </div>

      {/* Alerta de visitas do dia */}
      {visitasHoje.length > 0 && (
        <Alert className="border-primary bg-primary/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Visitas para Hoje</AlertTitle>
          <AlertDescription>
            Você tem {visitasHoje.length} visita(s) agendada(s) para hoje:
            <ul className="mt-2 space-y-1">
              {visitasHoje.map(v => (
                <li key={v.id} className="text-sm">
                  • {format(new Date(v.data_visita), "HH:mm")} - {v.clientes?.empresa || "Cliente"}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border pointer-events-auto"
              locale={ptBR}
              modifiers={{
                hasEvent: diasComEventos,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  borderRadius: "50%",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Eventos do Dia - {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : eventosDodia.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum evento para este dia</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {eventosDodia.map((evento) => (
                  <Card key={evento.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        evento.tipo === "visita" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                      }`}>
                        {getTipoIcon(evento.tipo)}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{evento.hora !== "00:00" ? evento.hora : "Dia todo"}</span>
                          {getTipoBadge(evento.tipo, evento.status)}
                        </div>
                        <div className="font-medium text-sm truncate">{evento.titulo}</div>
                        {evento.cliente && (
                          <div className="text-xs text-muted-foreground truncate">
                            Cliente: {evento.cliente}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : proximosEventos.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Nenhum evento agendado
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {proximosEventos.slice(0, 9).map((evento) => (
                <Card key={evento.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      evento.tipo === "visita" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>
                      {getTipoIcon(evento.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {format(evento.data, "dd/MM", { locale: ptBR })}
                        </span>
                        <Badge variant={evento.tipo === "visita" ? "default" : "outline"} className="text-xs">
                          {evento.tipo === "visita" ? "Visita" : "Tarefa"}
                        </Badge>
                      </div>
                      <div className="font-medium text-sm truncate">{evento.titulo}</div>
                      {evento.cliente && (
                        <div className="text-xs text-muted-foreground truncate">{evento.cliente}</div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
