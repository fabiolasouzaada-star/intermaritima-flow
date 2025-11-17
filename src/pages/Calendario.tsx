import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, FileText, Clock } from "lucide-react";
import { useState } from "react";

const mockEventos = [
  { id: 1, tipo: "visita", cliente: "ABC Importadora", data: "2025-11-20", hora: "14:00", responsavel: "João Silva" },
  { id: 2, tipo: "reuniao", cliente: "XYZ Exportadora", data: "2025-11-22", hora: "10:00", responsavel: "Maria Santos" },
  { id: 3, tipo: "followup", cliente: "Tech Solutions", data: "2025-11-20", hora: "16:00", responsavel: "Pedro Costa" },
  { id: 4, tipo: "renovacao", cliente: "Logística Moderna", data: "2025-11-20", hora: "09:00", responsavel: "Ana Paula" },
  { id: 5, tipo: "visita", cliente: "Comercial Sul América", data: "2025-11-25", hora: "15:00", responsavel: "Carlos Mendes" },
  { id: 6, tipo: "entrega", cliente: "Import Global", data: "2025-11-22", hora: "11:30", responsavel: "João Silva" },
];

export default function Calendario() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventosHoje = mockEventos.filter(
    (e) => new Date(e.data).toDateString() === (date?.toDateString() || new Date().toDateString())
  );

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "visita":
        return <Users className="h-4 w-4" />;
      case "reuniao":
        return <CalendarDays className="h-4 w-4" />;
      case "renovacao":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline", label: string }> = {
      visita: { variant: "default", label: "Visita" },
      reuniao: { variant: "secondary", label: "Reunião" },
      followup: { variant: "outline", label: "Follow-up" },
      renovacao: { variant: "default", label: "Renovação" },
      entrega: { variant: "secondary", label: "Entrega" },
    };
    const item = config[tipo] || config.reuniao;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendário Comercial</h1>
        <p className="text-muted-foreground">Agenda de visitas, reuniões e compromissos</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Eventos do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventosHoje.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum evento para este dia</p>
            ) : (
              <div className="space-y-4">
                {eventosHoje
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map((evento) => (
                    <Card key={evento.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {getTipoIcon(evento.tipo)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{evento.hora}</span>
                            {getTipoBadge(evento.tipo)}
                          </div>
                          <div className="font-medium">{evento.cliente}</div>
                          <div className="text-sm text-muted-foreground">
                            Responsável: {evento.responsavel}
                          </div>
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
          <div className="space-y-3">
            {mockEventos
              .slice(0, 6)
              .map((evento) => (
                <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {getTipoIcon(evento.tipo)}
                    </div>
                    <div>
                      <div className="font-medium">{evento.cliente}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getTipoBadge(evento.tipo)}
                    <span className="text-sm text-muted-foreground">{evento.responsavel}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
