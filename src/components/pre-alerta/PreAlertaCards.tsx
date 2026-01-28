import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Container, Users, UserPlus, TrendingUp, Package } from "lucide-react";

interface PreAlertaCardsProps {
  stats: {
    totalNavios: number;
    totalCntr: number;
    totalCntr20: number;
    totalCntr40: number;
    totalClientes: number;
    clientesNaoCadastrados: number;
    navioMaiorVolume: { navio: string; volume: number };
  };
  isLoading?: boolean;
}

export function PreAlertaCards({ stats, isLoading }: PreAlertaCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Navios Previstos",
      value: stats.totalNavios,
      icon: Ship,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total CNTR",
      value: stats.totalCntr.toLocaleString("pt-BR"),
      icon: Container,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "CNTR 20'",
      value: stats.totalCntr20.toLocaleString("pt-BR"),
      icon: Package,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "CNTR 40'",
      value: stats.totalCntr40.toLocaleString("pt-BR"),
      icon: Package,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "Clientes Identificados",
      value: stats.totalClientes,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Clientes Não Cadastrados",
      value: stats.clientesNaoCadastrados,
      icon: UserPlus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: "Oportunidade",
    },
    {
      title: "Maior Volume",
      value: stats.navioMaiorVolume.volume.toLocaleString("pt-BR"),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      subtitle: stats.navioMaiorVolume.navio || "N/A",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
