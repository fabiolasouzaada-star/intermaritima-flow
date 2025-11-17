import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const receitaMensal = [
  { mes: "Jan", receita: 2100000, meta: 2000000 },
  { mes: "Fev", receita: 2300000, meta: 2000000 },
  { mes: "Mar", receita: 1900000, meta: 2000000 },
  { mes: "Abr", receita: 2500000, meta: 2000000 },
  { mes: "Mai", receita: 2400000, meta: 2000000 },
  { mes: "Jun", receita: 2600000, meta: 2000000 },
];

const conversaoPorEtapa = [
  { etapa: "Prospecção → Contato", conversao: 71 },
  { etapa: "Contato → Diagnóstico", conversao: 88 },
  { etapa: "Diagnóstico → Proposta", conversao: 64 },
  { etapa: "Proposta → Negociação", conversao: 67 },
  { etapa: "Negociação → Fechamento", conversao: 67 },
];

const motivosPerda = [
  { motivo: "Preço elevado", quantidade: 12, percentual: 40 },
  { motivo: "Prazo inadequado", quantidade: 7, percentual: 23 },
  { motivo: "Concorrência", quantidade: 6, percentual: 20 },
  { motivo: "Não qualificado", quantidade: 3, percentual: 10 },
  { motivo: "Outros", quantidade: 2, percentual: 7 },
];

const servicosMaisVendidos = [
  { servico: "Importação", receita: 8500000, clientes: 87 },
  { servico: "Exportação", receita: 6200000, clientes: 65 },
  { servico: "Armazém", receita: 3800000, clientes: 54 },
  { servico: "Carga Projeto", receita: 2900000, clientes: 23 },
  { servico: "CNT R", receita: 1600000, clientes: 35 },
];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análises e indicadores comerciais</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="mes-atual">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes-atual">Mês Atual</SelectItem>
              <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="semestre">Semestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold">23.5%</div>
                <div className="text-sm text-muted-foreground">Taxa Conversão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <div className="text-2xl font-bold">R$ 2.4M</div>
              <div className="text-sm text-muted-foreground">Receita Mês</div>
              <div className="text-xs text-success mt-1">+15% vs anterior</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">Novos Clientes</div>
              <div className="text-xs text-success mt-1">+8% vs anterior</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <div className="text-2xl font-bold">R$ 450K</div>
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
              <div className="text-xs text-muted-foreground mt-1">Estável</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${(value as number / 1000).toFixed(0)}K`} />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="hsl(var(--primary))" name="Receita" strokeWidth={2} />
                <Line type="monotone" dataKey="meta" stroke="hsl(var(--muted-foreground))" name="Meta" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversaoPorEtapa} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" />
                <YAxis dataKey="etapa" type="category" width={150} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="conversao" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Motivos de Perda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {motivosPerda.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.motivo}</span>
                    <span className="text-muted-foreground">{item.quantidade} casos ({item.percentual}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${item.percentual}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicosMaisVendidos.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">{item.servico}</div>
                    <div className="text-sm text-muted-foreground">{item.clientes} clientes</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL',
                        notation: 'compact',
                        maximumFractionDigits: 1 
                      }).format(item.receita)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Relatório Semanal de Vendas",
              "Relatório Mensal Consolidado",
              "Análise por Segmento",
              "Performance por Vendedor",
              "Análise de Serviços",
              "Relatório de Perdas",
              "Forecast vs Realizado",
              "Volume por Cliente",
            ].map((relatorio, idx) => (
              <Button key={idx} variant="outline" className="justify-between h-auto py-4">
                <span>{relatorio}</span>
                <FileDown className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
