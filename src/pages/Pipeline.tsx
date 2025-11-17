import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const pipelineStages = [
  {
    name: "Prospecção",
    color: "bg-gray-500",
    deals: [
      { id: 1, empresa: "Nova Indústria XYZ", valor: 120000, probabilidade: 10, responsavel: "João Silva", previsao: "2025-12-15" },
      { id: 2, empresa: "Comércio ABC", valor: 85000, probabilidade: 10, responsavel: "Maria Santos", previsao: "2025-12-20" },
    ]
  },
  {
    name: "Primeiro Contato",
    color: "bg-blue-500",
    deals: [
      { id: 3, empresa: "Tech Solutions", valor: 250000, probabilidade: 20, responsavel: "Pedro Costa", previsao: "2025-12-10" },
      { id: 4, empresa: "Logística Moderna", valor: 95000, probabilidade: 20, responsavel: "Ana Paula", previsao: "2025-12-18" },
    ]
  },
  {
    name: "Diagnóstico",
    color: "bg-purple-500",
    deals: [
      { id: 5, empresa: "Exportadora Sul", valor: 180000, probabilidade: 40, responsavel: "Carlos Mendes", previsao: "2025-11-30" },
    ]
  },
  {
    name: "Proposta Enviada",
    color: "bg-yellow-500",
    deals: [
      { id: 6, empresa: "Import Global", valor: 320000, probabilidade: 60, responsavel: "João Silva", previsao: "2025-11-25" },
      { id: 7, empresa: "Agro Forte", valor: 210000, probabilidade: 60, responsavel: "Maria Santos", previsao: "2025-11-28" },
    ]
  },
  {
    name: "Negociação",
    color: "bg-orange-500",
    deals: [
      { id: 8, empresa: "Indústria Pesada SA", valor: 450000, probabilidade: 80, responsavel: "Pedro Costa", previsao: "2025-11-22" },
    ]
  },
  {
    name: "Fechamento",
    color: "bg-green-600",
    deals: [
      { id: 9, empresa: "Varejo Nacional", valor: 280000, probabilidade: 90, responsavel: "Ana Paula", previsao: "2025-11-20" },
    ]
  },
];

export default function Pipeline() {
  const totalDeals = pipelineStages.reduce((acc, stage) => acc + stage.deals.length, 0);
  const totalValue = pipelineStages.reduce(
    (acc, stage) => acc + stage.deals.reduce((sum, deal) => sum + deal.valor, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">Funil comercial completo</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Oportunidade
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">No pipeline atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">Receita prevista</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-success">+3.2% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {pipelineStages.map((stage) => {
          const stageTotal = stage.deals.reduce((sum, deal) => sum + deal.valor, 0);
          
          return (
            <Card key={stage.name} className="col-span-6 md:col-span-3 lg:col-span-1">
              <CardHeader className={`${stage.color} text-white rounded-t-lg`}>
                <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                <div className="text-xs">
                  {stage.deals.length} negócios
                </div>
                <div className="text-xs font-semibold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(stageTotal)}
                </div>
              </CardHeader>
              <ScrollArea className="h-[600px]">
                <CardContent className="p-2 space-y-2">
                  {stage.deals.map((deal) => (
                    <Card key={deal.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm">{deal.empresa}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.valor)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(deal.previsao).toLocaleDateString('pt-BR')}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {deal.probabilidade}% chance
                        </Badge>
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          {deal.responsavel}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
