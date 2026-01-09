import { useState, useMemo } from "react";
import { useClientes } from "@/hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Eye, X, Users, LayoutGrid, List, ArrowUpAZ, ArrowDownAZ, Building2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type SortOrder = "az" | "za";
type ViewMode = "list" | "cards";

export default function CarteiraComercial() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: clientes, isLoading } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroView, setFiltroView] = useState<"geral" | "ativos_com_movimento" | "ativos_sem_movimento" | "inativos_com_historico">("geral");
  const [filtroSegmento, setFiltroSegmento] = useState<string>("todos");
  const [filtroVolumeMin, setFiltroVolumeMin] = useState("");
  const [filtroVolumeMax, setFiltroVolumeMax] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");

  // Pegar comercial do URL ou usar "todos"
  const comercialSelecionado = searchParams.get("comercial") || "todos";

  // Extrair comerciais únicos dos clientes
  const comerciaisDisponiveis = useMemo(() => {
    if (!clientes) return [];
    const codigos = new Set<string>();
    clientes.forEach(c => {
      if (c.responsavel_codigo) {
        codigos.add(c.responsavel_codigo);
      }
    });
    return Array.from(codigos).sort();
  }, [clientes]);

  // Filtrar clientes pelo comercial selecionado
  const clientesDoComercial = useMemo(() => {
    if (!clientes) return [];
    if (comercialSelecionado === "todos") return clientes;
    return clientes.filter(c => c.responsavel_codigo === comercialSelecionado);
  }, [clientes, comercialSelecionado]);

  const segmentosDisponiveis = useMemo(() => {
    return Array.from(
      new Set(clientesDoComercial.flatMap(c => c.segmentos || []))
    ).sort();
  }, [clientesDoComercial]);

  const filteredClientes = useMemo(() => {
    const filtered = clientesDoComercial.filter(cliente => {
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

    // Sort by empresa name
    return filtered.sort((a, b) => {
      const comparison = a.empresa.localeCompare(b.empresa, 'pt-BR');
      return sortOrder === "az" ? comparison : -comparison;
    });
  }, [clientesDoComercial, searchTerm, filtroSegmento, filtroVolumeMin, filtroVolumeMax, filtroView, sortOrder]);

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      inativo: "secondary",
      prospecto: "outline",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getViewTitle = () => {
    const comercialName = comercialSelecionado === "todos" ? "Todos" : comercialSelecionado;
    switch (filtroView) {
      case "ativos_com_movimento":
        return `${comercialName} - Ativos com Movimento`;
      case "ativos_sem_movimento":
        return `${comercialName} - Ativos sem Movimento`;
      case "inativos_com_historico":
        return `${comercialName} - Inativos com Histórico`;
      default:
        return `Carteira ${comercialName} - Geral`;
    }
  };

  const handleComercialChange = (value: string) => {
    setSearchParams({ comercial: value });
    setFiltroSegmento("todos");
  };

  // Métricas resumidas
  const metricas = useMemo(() => {
    const total = clientesDoComercial.length;
    const ativos = clientesDoComercial.filter(c => c.status === "ativo").length;
    const inativos = clientesDoComercial.filter(c => c.status === "inativo").length;
    const prospectos = clientesDoComercial.filter(c => c.status === "prospecto").length;
    const volumeTotal = clientesDoComercial.reduce((sum, c) => sum + (c.volume_12_meses || 0), 0);
    return { total, ativos, inativos, prospectos, volumeTotal };
  }, [clientesDoComercial]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{getViewTitle()}</h1>
          <p className="text-muted-foreground">
            Gerenciamento de carteira por comercial
          </p>
        </div>
        <Select value={comercialSelecionado} onValueChange={handleComercialChange}>
          <SelectTrigger className="w-[200px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Selecione comercial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Comerciais</SelectItem>
            {comerciaisDisponiveis.map((codigo) => (
              <SelectItem key={codigo} value={codigo}>
                {codigo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Métricas resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metricas.total}</div>
            <p className="text-xs text-muted-foreground">Total Clientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{metricas.ativos}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">{metricas.inativos}</div>
            <p className="text-xs text-muted-foreground">Inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{metricas.prospectos}</div>
            <p className="text-xs text-muted-foreground">Prospectos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR').format(metricas.volumeTotal)}
            </div>
            <p className="text-xs text-muted-foreground">Volume 12M</p>
          </CardContent>
        </Card>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Clientes ({filteredClientes.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "az" ? "za" : "az")}
              className="gap-2"
            >
              {sortOrder === "az" ? (
                <ArrowUpAZ className="h-4 w-4" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" />
              )}
              {sortOrder === "az" ? "A-Z" : "Z-A"}
            </Button>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
              <ToggleGroupItem value="list" aria-label="Lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Cartões">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredClientes.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Nenhum cliente encontrado
                </div>
              ) : (
                filteredClientes.map((cliente) => (
                  <Card 
                    key={cliente.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/cliente/${cliente.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-base line-clamp-1">{cliente.empresa}</CardTitle>
                        </div>
                        {getStatusBadge(cliente.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cliente.segmentos && cliente.segmentos.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cliente.segmentos.slice(0, 3).map((seg) => (
                            <Badge key={seg} variant="outline" className="text-xs">
                              {seg}
                            </Badge>
                          ))}
                          {cliente.segmentos.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{cliente.segmentos.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Volume 12M: </span>
                          <span className="font-medium">
                            {cliente.volume_12_meses 
                              ? new Intl.NumberFormat('pt-BR').format(cliente.volume_12_meses) 
                              : '0'}
                          </span>
                        </div>
                        {cliente.responsavel_codigo && (
                          <Badge variant="secondary">{cliente.responsavel_codigo}</Badge>
                        )}
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cliente/${cliente.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
