import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mockContratos: Array<{
  id: number;
  cliente: string;
  inicio: string;
  termino: string;
  valor: number;
  servicos: string[];
  diasParaVencer: number;
  sla: string;
}> = [];

export default function Contratos() {
  const contratosCriticos = mockContratos.filter(c => c.diasParaVencer <= 30);
  const contratosAlerta = mockContratos.filter(c => c.diasParaVencer > 30 && c.diasParaVencer <= 90);

  const getStatusBadge = (dias: number) => {
    if (dias <= 30) {
      return <Badge variant="destructive">Vence em {dias} dias</Badge>;
    } else if (dias <= 90) {
      return <Badge className="bg-warning text-warning-foreground">Vence em {dias} dias</Badge>;
    } else {
      return <Badge variant="outline">Vence em {dias} dias</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contratos</h1>
        <p className="text-muted-foreground">Gestão e acompanhamento de contratos</p>
      </div>

      {contratosCriticos.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{contratosCriticos.length} contratos</strong> vencem nos próximos 30 dias. Ação urgente necessária!
          </AlertDescription>
        </Alert>
      )}

      {contratosAlerta.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <strong>{contratosAlerta.length} contratos</strong> vencem nos próximos 90 dias. Planeje a renovação.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{mockContratos.length}</div>
            <div className="text-sm text-muted-foreground">Contratos Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">{contratosCriticos.length}</div>
            <div className="text-sm text-muted-foreground">Críticos (≤30 dias)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">{contratosAlerta.length}</div>
            <div className="text-sm text-muted-foreground">Alerta (≤90 dias)</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Término</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockContratos.map((contrato) => (
                <TableRow key={contrato.id}>
                  <TableCell className="font-medium">{contrato.cliente}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(contrato.inicio).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(contrato.termino).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valor)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contrato.servicos.map((servico) => (
                        <Badge key={servico} variant="outline" className="text-xs">
                          {servico}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{contrato.sla}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(contrato.diasParaVencer)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
