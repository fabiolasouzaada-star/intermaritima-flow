import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Trash2, Users, LayoutGrid, List, ArrowUpAZ, ArrowDownAZ, Building2, Phone, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useClientes, useDeleteCliente } from "@/hooks/useClientes";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { useNavigate } from "react-router-dom";

type SortOrder = "az" | "za";
type ViewMode = "list" | "cards";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [comercialFilter, setComercialFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");
  
  const { data: clientes, isLoading } = useClientes();
  const deleteCliente = useDeleteCliente();
  const navigate = useNavigate();

  // Extrair comerciais únicos (códigos)
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

  const filteredClientes = useMemo(() => {
    const filtered = clientes?.filter(cliente => {
      const matchesSearch = 
        cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.cnpj && cliente.cnpj.includes(searchTerm));
      
      const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter;
      const matchesComercial = comercialFilter === "todos" || cliente.responsavel_codigo === comercialFilter;

      return matchesSearch && matchesStatus && matchesComercial;
    }) || [];

    // Sort by empresa name
    return filtered.sort((a, b) => {
      const comparison = a.empresa.localeCompare(b.empresa, 'pt-BR');
      return sortOrder === "az" ? comparison : -comparison;
    });
  }, [clientes, searchTerm, statusFilter, comercialFilter, sortOrder]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      ativo: { variant: "default", label: "Ativo" },
      inativo: { variant: "destructive", label: "Inativo" },
      prospecto: { variant: "secondary", label: "Prospecto" },
    };
    const config = variants[status] || variants.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestão completa da base de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={comercialFilter} onValueChange={setComercialFilter}>
              <SelectTrigger>
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por comercial" />
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="prospecto">Prospecto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Comercial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Potencial</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{cliente.empresa}</TableCell>
                      <TableCell>{cliente.cnpj || "-"}</TableCell>
                      <TableCell>
                        {cliente.segmentos && cliente.segmentos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cliente.segmentos.slice(0, 2).map((seg) => (
                              <Badge key={seg} variant="outline" className="text-xs">
                                {seg}
                              </Badge>
                            ))}
                            {cliente.segmentos.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{cliente.segmentos.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.responsavel_codigo ? (
                          <Badge variant="outline">{cliente.responsavel_codigo}</Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(cliente.status)}</TableCell>
                      <TableCell>{cliente.potencial || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/cliente/${cliente.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este cliente?")) {
                                deleteCliente.mutate(cliente.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                      {cliente.cnpj && (
                        <p className="text-sm text-muted-foreground">
                          CNPJ: {cliente.cnpj}
                        </p>
                      )}
                      
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
                        {cliente.responsavel_codigo ? (
                          <Badge variant="secondary">{cliente.responsavel_codigo}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem responsável</span>
                        )}
                        {cliente.potencial && (
                          <span className="text-sm font-medium">{cliente.potencial}</span>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cliente/${cliente.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Tem certeza que deseja excluir este cliente?")) {
                              deleteCliente.mutate(cliente.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
