import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X, Search } from "lucide-react";
import { PreAlertaFilters as FiltersType } from "@/hooks/usePreAlertaNavios";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface PreAlertaFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  navios: string[];
  armadores: string[];
  tiposContainer: string[];
  comerciais: string[];
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_abordagem", label: "Em Abordagem" },
  { value: "proposta_enviada", label: "Proposta Enviada" },
  { value: "convertido", label: "Convertido" },
  { value: "descartado", label: "Descartado" },
];

export function PreAlertaFiltersComponent({
  filters,
  onFiltersChange,
  navios,
  armadores,
  tiposContainer,
  comerciais,
}: PreAlertaFiltersProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [localFilters, setLocalFilters] = useState<FiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof FiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const emptyFilters: FiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(localFilters).filter(v => v !== undefined && v !== null && v !== "").length;

  return (
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Data ETA - Início</Label>
                <Input
                  type="date"
                  value={localFilters.dataInicio || ""}
                  onChange={(e) => handleChange("dataInicio", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Data ETA - Fim</Label>
                <Input
                  type="date"
                  value={localFilters.dataFim || ""}
                  onChange={(e) => handleChange("dataFim", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Navio</Label>
                <Select
                  value={localFilters.navio || "all"}
                  onValueChange={(v) => handleChange("navio", v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {navios.map((navio) => (
                      <SelectItem key={navio} value={navio}>
                        {navio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">NV</Label>
                <Input
                  placeholder="Buscar NV..."
                  value={localFilters.nv || ""}
                  onChange={(e) => handleChange("nv", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Armador</Label>
                <Select
                  value={localFilters.armador || "all"}
                  onValueChange={(v) => handleChange("armador", v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {armadores.map((armador) => (
                      <SelectItem key={armador} value={armador}>
                        {armador}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Cliente</Label>
                <Input
                  placeholder="Buscar cliente..."
                  value={localFilters.cliente || ""}
                  onChange={(e) => handleChange("cliente", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Cliente Intermarítima</Label>
                <Select
                  value={localFilters.clienteIntermaritima === true ? "sim" : localFilters.clienteIntermaritima === false ? "nao" : "all"}
                  onValueChange={(v) => handleChange("clienteIntermaritima", v === "all" ? null : v === "sim")}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tipo Container</Label>
                <Select
                  value={localFilters.tipoContainer || "all"}
                  onValueChange={(v) => handleChange("tipoContainer", v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {tiposContainer.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Volume Mínimo CNTR</Label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={localFilters.volumeMinimo || ""}
                  onChange={(e) => handleChange("volumeMinimo", e.target.value ? parseInt(e.target.value) : undefined)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Status Comercial</Label>
                <Select
                  value={localFilters.statusComercial || "all"}
                  onValueChange={(v) => handleChange("statusComercial", v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Comercial Responsável</Label>
                <Select
                  value={localFilters.comercialResponsavel || "all"}
                  onValueChange={(v) => handleChange("comercialResponsavel", v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {comerciais.map((comercial) => (
                      <SelectItem key={comercial} value={comercial}>
                        {comercial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
              <Button size="sm" onClick={handleApply}>
                <Search className="h-4 w-4 mr-1" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
