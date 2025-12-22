import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, AlertCircle, MapPin, ChevronLeft, ChevronRight, List, Grid3X3 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useVisitas } from "@/hooks/useVisitas";
import { useTarefas } from "@/hooks/useTarefas";
import { format, isToday, isSameDay, addDays, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, subDays, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Evento = {
  id: string;
  tipo: "visita" | "tarefa";
  titulo: string;
  cliente?: string;
  data: Date;
  hora: string;
  status: string;
};

export default function Calendario() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"agenda" | "calendar">("agenda");
  const { data: visitas, isLoading: isLoadingVisitas } = useVisitas();
  const { data: tarefas, isLoading: isLoadingTarefas } = useTarefas();

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

  // Gera todos os eventos
  const todosEventos = useMemo(() => {
    const eventos: Evento[] = [];

    if (visitas) {
      visitas.forEach(v => {
        const dataVisita = new Date(v.data_visita);
        eventos.push({
          id: v.id,
          tipo: "visita",
          titulo: v.objetivo || "Visita",
          cliente: v.clientes?.empresa,
          data: dataVisita,
          hora: format(dataVisita, "HH:mm"),
          status: v.status,
        });
      });
    }

    if (tarefas) {
      tarefas.forEach(t => {
        if (t.data_vencimento) {
          eventos.push({
            id: t.id,
            tipo: "tarefa",
            titulo: t.titulo,
            cliente: t.clientes?.empresa,
            data: new Date(t.data_vencimento),
            hora: "00:00",
            status: t.status,
          });
        }
      });
    }

    return eventos.sort((a, b) => a.data.getTime() - b.data.getTime());
  }, [visitas, tarefas]);

  // Eventos agrupados por dia para visão de agenda (próximos 30 dias)
  const eventosAgrupados = useMemo(() => {
    const hoje = startOfDay(new Date());
    const limite = addDays(hoje, 30);
    
    const dias = eachDayOfInterval({ start: hoje, end: limite });
    
    return dias.map(dia => {
      const eventosDoDia = todosEventos.filter(e => isSameDay(e.data, dia));
      return {
        data: dia,
        eventos: eventosDoDia.sort((a, b) => a.hora.localeCompare(b.hora)),
      };
    }).filter(d => d.eventos.length > 0);
  }, [todosEventos]);

  // Eventos da semana atual
  const eventosSemana = useMemo(() => {
    const inicioSemana = startOfWeek(date, { weekStartsOn: 0 });
    const fimSemana = endOfWeek(date, { weekStartsOn: 0 });
    const dias = eachDayOfInterval({ start: inicioSemana, end: fimSemana });
    
    return dias.map(dia => {
      const eventosDoDia = todosEventos.filter(e => isSameDay(e.data, dia));
      return {
        data: dia,
        eventos: eventosDoDia.sort((a, b) => a.hora.localeCompare(b.hora)),
      };
    });
  }, [todosEventos, date]);

  // Dias com eventos para marcar no calendário
  const diasComEventos = useMemo(() => {
    return todosEventos.map(e => e.data);
  }, [todosEventos]);

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

  const getStatusColor = (tipo: string, status: string) => {
    if (tipo === "visita") {
      switch (status) {
        case "agendada": return "border-l-primary bg-primary/5";
        case "realizada": return "border-l-green-500 bg-green-500/5";
        case "cancelada": return "border-l-destructive bg-destructive/5";
        default: return "border-l-primary bg-primary/5";
      }
    }
    switch (status) {
      case "pendente": return "border-l-yellow-500 bg-yellow-500/5";
      case "em_andamento": return "border-l-blue-500 bg-blue-500/5";
      case "concluida": return "border-l-green-500 bg-green-500/5";
      default: return "border-l-muted bg-muted/5";
    }
  };

  const getStatusBadge = (tipo: string, status: string) => {
    if (tipo === "visita") {
      const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
        agendada: { variant: "default", label: "Agendada" },
        realizada: { variant: "secondary", label: "Realizada" },
        cancelada: { variant: "destructive", label: "Cancelada" },
        a_agendar: { variant: "outline", label: "A Agendar" },
      };
      const item = config[status] || config.agendada;
      return <Badge variant={item.variant} className="text-xs">{item.label}</Badge>;
    }
    
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      em_andamento: { variant: "default", label: "Em Andamento" },
      concluida: { variant: "secondary", label: "Concluída" },
      cancelada: { variant: "destructive", label: "Cancelada" },
    };
    const item = config[status] || config.pendente;
    return <Badge variant={item.variant} className="text-xs">{item.label}</Badge>;
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setDate(subDays(date, 7));
    } else {
      setDate(addDays(date, 7));
    }
  };

  const isLoading = isLoadingVisitas || isLoadingTarefas;

  const EventoCard = ({ evento }: { evento: Evento }) => (
    <div className={`border-l-4 rounded-r-lg p-3 ${getStatusColor(evento.tipo, evento.status)} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
          evento.tipo === "visita" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
        }`}>
          {getTipoIcon(evento.tipo)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold text-sm">
              {evento.hora !== "00:00" ? evento.hora : "Dia todo"}
            </span>
            {getStatusBadge(evento.tipo, evento.status)}
          </div>
          <div className="font-medium text-sm">{evento.titulo}</div>
          {evento.cliente && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>📍</span> {evento.cliente}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DiaHeader = ({ dia, showFullDate = false }: { dia: Date; showFullDate?: boolean }) => {
    const hoje = isToday(dia);
    return (
      <div className={`sticky top-0 z-10 py-3 px-4 ${hoje ? "bg-primary/10" : "bg-muted/50"} backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${hoje ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
            <span className="text-xs font-medium uppercase">
              {format(dia, "EEE", { locale: ptBR })}
            </span>
            <span className="text-lg font-bold leading-none">
              {format(dia, "dd")}
            </span>
          </div>
          <div>
            <div className="font-semibold">
              {hoje ? "Hoje" : format(dia, "EEEE", { locale: ptBR })}
            </div>
            {showFullDate && (
              <div className="text-xs text-muted-foreground">
                {format(dia, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Calendário Comercial</h1>
          <p className="text-muted-foreground text-sm md:text-base">Agenda de visitas, reuniões e compromissos</p>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "agenda" | "calendar")}>
          <TabsList>
            <TabsTrigger value="agenda" className="gap-2">
              <List className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>
        </Tabs>
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

      {viewMode === "agenda" ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                Hoje
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Carregando...
              </div>
            ) : eventosAgrupados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum evento agendado</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                <div className="divide-y">
                  {eventosAgrupados.map(({ data: dia, eventos }) => (
                    <div key={dia.toISOString()}>
                      <DiaHeader dia={dia} showFullDate />
                      <div className="p-4 space-y-2">
                        {eventos.map((evento) => (
                          <EventoCard key={evento.id} evento={evento} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calendário</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
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

          <Card className="overflow-hidden">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Semana de {format(startOfWeek(date, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })} - {format(endOfWeek(date, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Hoje
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
                  <div className="divide-y">
                    {eventosSemana.map(({ data: dia, eventos }) => (
                      <div key={dia.toISOString()}>
                        <DiaHeader dia={dia} />
                        <div className="p-4">
                          {eventos.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              Sem eventos
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {eventos.map((evento) => (
                                <EventoCard key={evento.id} evento={evento} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
