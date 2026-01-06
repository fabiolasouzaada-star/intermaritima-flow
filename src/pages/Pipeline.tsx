import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, TrendingUp, Plus, Search, Users, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOportunidades, Oportunidade } from "@/hooks/useOportunidades";
import { useClientes } from "@/hooks/useClientes";
import { OportunidadeForm } from "@/components/forms/OportunidadeForm";
import { OportunidadeEditForm } from "@/components/forms/OportunidadeEditForm";
import { PipelineKanban } from "@/components/pipeline/PipelineKanban";
import { PipelineListView } from "@/components/pipeline/PipelineListView";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Pipeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOportunidade, setSelectedOportunidade] = useState<Oportunidade | null>(null);
  const [clienteFilter, setClienteFilter] = useState("");
  const [comercialFilter, setComercialFilter] = useState("todos");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const { data: oportunidades, isLoading } = useOportunidades();
  const { data: clientes } = useClientes();

  // Extrair comerciais únicos (códigos) dos clientes
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

  // Mapa de cliente_id para responsavel_codigo
  const clienteToComercial = useMemo(() => {
    const map = new Map<string, string>();
    clientes?.forEach(c => {
      if (c.responsavel_codigo) {
        map.set(c.id, c.responsavel_codigo);
      }
    });
    return map;
  }, [clientes]);

  const filteredOportunidades = useMemo(() => {
    if (!oportunidades) return [];
    let filtered = oportunidades;

    // Filtro por comercial (baseado no cliente)
    if (comercialFilter && comercialFilter !== "todos") {
      filtered = filtered.filter(op => clienteToComercial.get(op.cliente_id) === comercialFilter);
    }

    // Filtro por cliente
    if (clienteFilter.trim()) {
      const searchTerm = clienteFilter.toLowerCase().trim();
      filtered = filtered.filter(op => 
        op.clientes?.empresa?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [oportunidades, clienteFilter, comercialFilter, clienteToComercial]);

  const totalDeals = filteredOportunidades.length;
  const totalValue = filteredOportunidades.reduce((sum, op) => sum + (op.valor || 0), 0);
  const taxaConversao = totalDeals > 0 
    ? ((filteredOportunidades.filter(op => op.status === 'ganho').length) / totalDeals * 100).toFixed(1)
    : "0.0";

  const handleCardClick = (oportunidade: Oportunidade) => {
    setSelectedOportunidade(oportunidade);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            {viewMode === "kanban" 
              ? "Arraste os cards para mover entre etapas" 
              : "Clique em uma linha para editar"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as "kanban" | "list")}
            className="border rounded-md"
          >
            <ToggleGroupItem value="kanban" aria-label="Visualização Kanban">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Visualização Lista">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={comercialFilter} onValueChange={setComercialFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar Comercial" />
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar por cliente..."
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
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

      {viewMode === "kanban" ? (
        <PipelineKanban oportunidades={filteredOportunidades} />
      ) : (
        <PipelineListView oportunidades={filteredOportunidades} onCardClick={handleCardClick} />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oportunidade</DialogTitle>
          </DialogHeader>
          {selectedOportunidade && (
            <OportunidadeEditForm 
              oportunidade={selectedOportunidade} 
              onSuccess={() => setEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
