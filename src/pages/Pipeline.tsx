import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOportunidades } from "@/hooks/useOportunidades";
import { OportunidadeForm } from "@/components/forms/OportunidadeForm";

const statusMap: Record<string, string> = {
  qualificacao: "Prospecção",
  proposta: "Proposta Enviada",
  negociacao: "Negociação",
  fechamento: "Fechamento",
  ganho: "Ganho",
  perdido: "Perdido"
};

const statusColors: Record<string, string> = {
  qualificacao: "bg-gray-500",
  proposta: "bg-yellow-500",
  negociacao: "bg-orange-500",
  fechamento: "bg-green-600",
  ganho: "bg-green-700",
  perdido: "bg-red-500"
};

export default function Pipeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: oportunidades, isLoading } = useOportunidades();

  const groupedOportunidades = oportunidades?.reduce((acc, oportunidade) => {
    const status = oportunidade.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(oportunidade);
    return acc;
  }, {} as Record<string, typeof oportunidades>);

  const totalDeals = oportunidades?.length || 0;
  const totalValue = oportunidades?.reduce((sum, op) => sum + (op.valor || 0), 0) || 0;
  const taxaConversao = totalDeals > 0 
    ? ((oportunidades?.filter(op => op.status === 'ganho').length || 0) / totalDeals * 100).toFixed(1)
    : "0.0";

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">Funil comercial completo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Oportunidade</DialogTitle>
            </DialogHeader>
            <OportunidadeForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConversao}%</div>
            <p className="text-xs text-muted-foreground">Oportunidades ganhas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
        {Object.entries(statusMap).map(([statusKey, statusName]) => {
          const deals = groupedOportunidades?.[statusKey as keyof typeof groupedOportunidades] || [];
          return (
            <Card key={statusKey} className="min-w-[280px]">
              <CardHeader className={`${statusColors[statusKey]} text-white rounded-t-lg`}>
                <CardTitle className="text-sm font-medium">
                  {statusName}
                  <Badge className="ml-2 bg-white text-gray-900">{deals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <Card key={deal.id} className="p-4 border-2 hover:border-primary cursor-pointer">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">
                            {deal.clientes?.empresa || "Cliente não informado"}
                          </h3>
                          <p className="text-xs text-muted-foreground">{deal.titulo}</p>
                          <div className="space-y-1 text-xs">
                            {deal.valor && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.valor)}
                              </div>
                            )}
                            {deal.probabilidade && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                {deal.probabilidade}% probabilidade
                              </div>
                            )}
                            {deal.previsao_fechamento && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(deal.previsao_fechamento).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
