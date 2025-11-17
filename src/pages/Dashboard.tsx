import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  Users, 
  UserX, 
  TrendingUp, 
  DollarSign,
  Target,
  FileCheck,
  ClipboardList,
  PhoneCall,
  PackageSearch
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const pipelineData = [
  { name: "Prospecção", value: 45 },
  { name: "Primeiro Contato", value: 32 },
  { name: "Diagnóstico", value: 28 },
  { name: "Proposta", value: 18 },
  { name: "Negociação", value: 12 },
  { name: "Fechamento", value: 8 },
];

const servicosData = [
  { name: "Importação", value: 35 },
  { name: "Exportação", value: 28 },
  { name: "Armazém", value: 18 },
  { name: "Carga Projeto", value: 12 },
  { name: "CNT R", value: 7 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Comercial</h1>
        <p className="text-muted-foreground">Visão geral do CRM Intermarítima</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Clientes Ativos"
          value="284"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Clientes Inativos"
          value="47"
          icon={UserX}
          trend={{ value: -8, isPositive: true }}
        />
        <MetricCard
          title="Taxa de Conversão"
          value="18.5%"
          icon={Target}
          trend={{ value: 3.2, isPositive: true }}
        />
        <MetricCard
          title="Receita Fechada (Mês)"
          value="R$ 2.4M"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Prevista"
          value="R$ 5.8M"
          icon={TrendingUp}
        />
        <MetricCard
          title="Contratos a Vencer"
          value="12"
          icon={FileCheck}
          className="border-warning"
        />
        <MetricCard
          title="Visitas Realizadas"
          value="68"
          icon={ClipboardList}
        />
        <MetricCard
          title="Follow-ups Pendentes"
          value="23"
          icon={PhoneCall}
          className="border-warning"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {servicosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5" />
            Clientes por Segmento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { segmento: "Indústria", count: 87, color: "bg-chart-1" },
              { segmento: "Comércio", count: 65, color: "bg-chart-2" },
              { segmento: "Agronegócio", count: 54, color: "bg-chart-3" },
              { segmento: "Varejo", count: 43, color: "bg-chart-4" },
              { segmento: "Tecnologia", count: 35, color: "bg-chart-5" },
            ].map((item) => (
              <div key={item.segmento} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 font-medium">{item.segmento}</span>
                <span className="text-muted-foreground">{item.count} clientes</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
