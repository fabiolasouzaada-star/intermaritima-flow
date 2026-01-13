import { useState, useMemo } from "react";
import { Ship } from "lucide-react";
import { 
  usePreAlertaItens, 
  useNaviosAgregados, 
  usePreAlertaStats,
  PreAlertaFilters,
  NavioAgregado
} from "@/hooks/usePreAlertaNavios";
import { PreAlertaCards } from "@/components/pre-alerta/PreAlertaCards";
import { PreAlertaFiltersComponent } from "@/components/pre-alerta/PreAlertaFilters";
import { PreAlertaTable } from "@/components/pre-alerta/PreAlertaTable";
import { PreAlertaUpload } from "@/components/pre-alerta/PreAlertaUpload";
import { NavioDetailDialog } from "@/components/pre-alerta/NavioDetailDialog";

export default function PreAlertaNavios() {
  const [filters, setFilters] = useState<PreAlertaFilters>({});
  const [selectedNavio, setSelectedNavio] = useState<NavioAgregado | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: itens, isLoading: isLoadingItens } = usePreAlertaItens(filters);
  const { data: navios, isLoading: isLoadingNavios } = useNaviosAgregados(filters);
  const { stats, isLoading: isLoadingStats } = usePreAlertaStats(filters);

  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    if (!itens) return { navios: [], armadores: [], tiposContainer: [], comerciais: [] };
    
    const naviosSet = new Set<string>();
    const armadoresSet = new Set<string>();
    const tiposContainerSet = new Set<string>();
    const comerciaisSet = new Set<string>();

    itens.forEach(item => {
      if (item.navio) naviosSet.add(item.navio);
      if (item.armador) armadoresSet.add(item.armador);
      if (item.tipo_container) tiposContainerSet.add(item.tipo_container);
      if (item.comercial_responsavel) comerciaisSet.add(item.comercial_responsavel);
    });

    return {
      navios: Array.from(naviosSet).sort(),
      armadores: Array.from(armadoresSet).sort(),
      tiposContainer: Array.from(tiposContainerSet).sort(),
      comerciais: Array.from(comerciaisSet).sort(),
    };
  }, [itens]);

  const handleNavioClick = (navio: NavioAgregado) => {
    setSelectedNavio(navio);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="h-6 w-6" />
            Pré-Alerta de Navios
          </h1>
          <p className="text-muted-foreground mt-1">
            Inteligência comercial antecipada com base em previsões de chegada
          </p>
        </div>
        <PreAlertaUpload />
      </div>

      {/* Stats Cards */}
      <PreAlertaCards stats={stats} isLoading={isLoadingStats} />

      {/* Filters */}
      <PreAlertaFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        navios={filterOptions.navios}
        armadores={filterOptions.armadores}
        tiposContainer={filterOptions.tiposContainer}
        comerciais={filterOptions.comerciais}
      />

      {/* Table */}
      <PreAlertaTable
        navios={navios}
        isLoading={isLoadingNavios}
        onNavioClick={handleNavioClick}
      />

      {/* Detail Dialog */}
      <NavioDetailDialog
        navio={selectedNavio}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
