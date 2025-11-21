import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CarteiraFS() {
  const navigate = useNavigate();
  const { data: clientes, isLoading } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroView, setFiltroView] = useState<"geral" | "ativos_com_movimento" | "ativos_sem_movimento" | "inativos_com_historico">("geral");

  const clientesFS = clientes?.filter(cliente => 
    cliente.responsavel_codigo === "FS" || cliente.is_cliente_fs === true
  ) || [];

  const filteredClientes = clientesFS.filter(cliente => {
    const matchesSearch = cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj?.includes(searchTerm);
    
    switch (filtroView) {
      case "ativos_com_movimento":
        return matchesSearch && cliente.status === "ativo" && (cliente.volume_12_meses || 0) > 0;
      case "ativos_sem_movimento":
        return matchesSearch && cliente.status === "ativo" && (cliente.volume_12_meses || 0) === 0;
      case "inativos_com_historico":
        return matchesSearch && cliente.status === "inativo" && (cliente.volume_12_meses || 0) > 0;
      default:
        return matchesSearch;
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      prospecto: "outline",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getViewTitle = () => {
    switch (filtroView) {
      case "ativos_com_movimento":
        return "FS - Ativos com Movimento";
      case "ativos_sem_movimento":
        return "FS - Ativos sem Movimento";
      case "inativos_com_historico":
        return "FS - Inativos com Histórico";
      default:
        return "Carteira FS - Geral";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getViewTitle()}</h1>
        <p className="text-muted-foreground">
          Gerenciamento da carteira de clientes FS
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filtroView} onValueChange={(value: any) => setFiltroView(value)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione a visão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Carteira Geral</SelectItem>
                <SelectItem value="ativos_com_movimento">Ativos com Movimento</SelectItem>
                <SelectItem value="ativos_sem_movimento">Ativos sem Movimento</SelectItem>
                <SelectItem value="inativos_com_historico">Inativos com Histórico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Volume 12M</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.empresa}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente.segmento}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(cliente.status)}</TableCell>
                    <TableCell>
                      {cliente.volume_12_meses 
                        ? new Intl.NumberFormat('pt-BR').format(cliente.volume_12_meses) 
                        : '0'}
                    </TableCell>
                    <TableCell>{cliente.responsavel_codigo || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/cliente/${cliente.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
