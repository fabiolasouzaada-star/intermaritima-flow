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

const pipelineData: { name: string; value: number }[] = [];

const servicosData: { name: string; value: number }[] = [];

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
          value="0"
          icon={Users}
        />
        <MetricCard
          title="Clientes Inativos"
          value="0"
          icon={UserX}
        />
        <MetricCard
          title="Taxa de Conversão"
          value="0%"
          icon={Target}
        />
        <MetricCard
          title="Receita Fechada (Mês)"
          value="R$ 0"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Prevista"
          value="R$ 0"
          icon={TrendingUp}
        />
        <MetricCard
          title="Contratos a Vencer"
          value="0"
          icon={FileCheck}
        />
        <MetricCard
          title="Visitas Realizadas"
          value="0"
          icon={ClipboardList}
        />
        <MetricCard
          title="Follow-ups Pendentes"
          value="0"
          icon={PhoneCall}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
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
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
