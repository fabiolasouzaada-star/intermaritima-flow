import { useState } from "react";
import { Bell, AlertTriangle, FileText, Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useCheckAndMoveStaleOpportunities, type Notification } from "@/hooks/useNotifications";

const notificationIcons = {
  tarefa_atrasada: AlertTriangle,
  contrato_vencendo: FileText,
  visita_semana: Calendar,
  oportunidade_sem_retorno: Clock,
};

const notificationColors = {
  tarefa_atrasada: "text-destructive",
  contrato_vencendo: "text-amber-500",
  visita_semana: "text-blue-500",
  oportunidade_sem_retorno: "text-orange-500",
};

const notificationBadgeVariants: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  tarefa_atrasada: "destructive",
  contrato_vencendo: "secondary",
  visita_semana: "default",
  oportunidade_sem_retorno: "outline",
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  
  // Run the stale opportunities check in background
  useCheckAndMoveStaleOpportunities();

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const groupedNotifications = {
    tarefa_atrasada: notifications.filter((n) => n.type === "tarefa_atrasada"),
    contrato_vencendo: notifications.filter((n) => n.type === "contrato_vencendo"),
    visita_semana: notifications.filter((n) => n.type === "visita_semana"),
    oportunidade_sem_retorno: notifications.filter((n) => n.type === "oportunidade_sem_retorno"),
  };

  const totalCount = notifications.length;
  const hasUrgent = groupedNotifications.tarefa_atrasada.length > 0 || groupedNotifications.oportunidade_sem_retorno.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 ${hasUrgent ? "text-destructive" : ""}`} />
          {totalCount > 0 && (
            <Badge
              variant={hasUrgent ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {totalCount > 99 ? "99+" : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Central de Notificações</h4>
          <p className="text-sm text-muted-foreground">
            {totalCount === 0 ? "Nenhuma notificação" : `${totalCount} notificação(ões)`}
          </p>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Tudo em dia!</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Tarefas Atrasadas */}
              {groupedNotifications.tarefa_atrasada.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      Tarefas Atrasadas ({groupedNotifications.tarefa_atrasada.length})
                    </span>
                  </div>
                  {groupedNotifications.tarefa_atrasada.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}

              {/* Oportunidades Sem Retorno */}
              {groupedNotifications.oportunidade_sem_retorno.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-500">
                      Oportunidades Sem Retorno ({groupedNotifications.oportunidade_sem_retorno.length})
                    </span>
                  </div>
                  {groupedNotifications.oportunidade_sem_retorno.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}

              {/* Contratos a Vencer */}
              {groupedNotifications.contrato_vencendo.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-500">
                      Contratos a Vencer ({groupedNotifications.contrato_vencendo.length})
                    </span>
                  </div>
                  {groupedNotifications.contrato_vencendo.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}

              {/* Visitas da Semana */}
              {groupedNotifications.visita_semana.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">
                      Visitas da Semana ({groupedNotifications.visita_semana.length})
                    </span>
                  </div>
                  {groupedNotifications.visita_semana.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const Icon = notificationIcons[notification.type];
  const colorClass = notificationColors[notification.type];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 mt-0.5 ${colorClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{notification.description}</p>
          {notification.date && (
            <p className="text-xs text-muted-foreground">
              {format(parseISO(notification.date), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
