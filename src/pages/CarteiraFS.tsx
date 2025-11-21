import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Eye, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { SEGMENTOS } from "@/constants/segmentos";

export default function CarteiraFS() {
  const navigate = useNavigate();
  const { data: clientes, isLoading } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroView, setFiltroView] = useState<"geral" | "ativos_com_movimento" | "ativos_sem_movimento" | "inativos_com_historico">("geral");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");
  const [filtroVolumeMin, setFiltroVolumeMin] = useState("");
  const [filtroVolumeMax, setFiltroVolumeMax] = useState("");

  const clientesFS = clientes?.filter(cliente => 
    cliente.responsavel_codigo === "FS" || cliente.is_cliente_fs === true
  ) || [];

  const segmentosDisponiveis = Array.from(
    new Set(clientesFS.flatMap(c => c.segmentos || []))
  ).sort();

  const filteredClientes = clientesFS.filter(cliente => {
    const matchesSearch = cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj?.includes(searchTerm);
    
    const matchesSegmento = filtroSegmento === "todos" || 
      (cliente.segmentos && cliente.segmentos.includes(filtroSegmento));
    
    const volumeMin = filtroVolumeMin ? parseFloat(filtroVolumeMin) : null;
    const volumeMax = filtroVolumeMax ? parseFloat(filtroVolumeMax) : null;
    const clienteVolume = cliente.volume_12_meses || 0;
    const matchesVolume = 
      (volumeMin === null || clienteVolume >= volumeMin) &&
      (volumeMax === null || clienteVolume <= volumeMax);
    
    let matchesView = true;
    switch (filtroView) {
      case "ativos_com_movimento":
        matchesView = cliente.status === "ativo" && clienteVolume > 0;
        break;
      case "ativos_sem_movimento":
        matchesView = cliente.status === "ativo" && clienteVolume === 0;
        break;
      case "inativos_com_historico":
        matchesView = cliente.status === "inativo" && clienteVolume > 0;
        break;
    }
    
    return matchesSearch && matchesSegmento && matchesVolume && matchesView;
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os segmentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os segmentos</SelectItem>
                  {segmentosDisponiveis.map((segmento) => (
                    <SelectItem key={segmento} value={segmento}>
                      {segmento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Volume Mínimo (12 meses)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={filtroVolumeMin}
                  onChange={(e) => setFiltroVolumeMin(e.target.value)}
                />
                {filtroVolumeMin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setFiltroVolumeMin("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Volume Máximo (12 meses)</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Sem limite"
                  value={filtroVolumeMax}
                  onChange={(e) => setFiltroVolumeMax(e.target.value)}
                />
                {filtroVolumeMax && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setFiltroVolumeMax("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {(filtroSegmento !== "todos" || filtroVolumeMin || filtroVolumeMax) && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiltroSegmento("todos");
                  setFiltroVolumeMin("");
                  setFiltroVolumeMax("");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar filtros avançados
              </Button>
            </div>
          )}
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
                      {cliente.segmentos && cliente.segmentos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cliente.segmentos.map((seg) => (
                            <Badge key={seg} variant="outline" className="text-xs">
                              {seg}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline">-</Badge>
                      )}
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
