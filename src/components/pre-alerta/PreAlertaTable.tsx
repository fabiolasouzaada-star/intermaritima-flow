import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Ship, 
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2
} from "lucide-react";
import { NavioAgregado, useDeleteNavioItens } from "@/hooks/usePreAlertaNavios";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PreAlertaTableProps {
  navios: NavioAgregado[];
  isLoading?: boolean;
  onNavioClick: (navio: NavioAgregado) => void;
}

type SortField = "navio" | "eta" | "total_cntr" | "total_clientes" | "armador";
type SortDirection = "asc" | "desc";

export function PreAlertaTable({ navios, isLoading, onNavioClick }: PreAlertaTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("eta");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [navioToDelete, setNavioToDelete] = useState<NavioAgregado | null>(null);
  
  const deleteNavioMutation = useDeleteNavioItens();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteNavio = () => {
    if (navioToDelete) {
      deleteNavioMutation.mutate({ 
        navio: navioToDelete.navio, 
        nv: navioToDelete.nv 
      });
      setNavioToDelete(null);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const filteredNavios = navios
    .filter((navio) => {
      const search = searchTerm.toLowerCase();
      return (
        navio.navio.toLowerCase().includes(search) ||
        (navio.nv && navio.nv.toLowerCase().includes(search)) ||
        (navio.armador && navio.armador.toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "navio":
          comparison = a.navio.localeCompare(b.navio);
          break;
        case "eta":
          comparison = (a.eta || "").localeCompare(b.eta || "");
          break;
        case "total_cntr":
          comparison = a.total_cntr - b.total_cntr;
          break;
        case "total_clientes":
          comparison = a.total_clientes - b.total_clientes;
          break;
        case "armador":
          comparison = (a.armador || "").localeCompare(b.armador || "");
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const getVolumeClass = (volume: number) => {
    if (volume >= 50) return "bg-red-100 text-red-800 font-bold";
    if (volume >= 20) return "bg-orange-100 text-orange-800 font-semibold";
    if (volume >= 10) return "bg-yellow-100 text-yellow-800";
    return "";
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar navio, NV ou armador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredNavios.length} navio(s)
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("navio")}
                >
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    Navio
                    <SortIcon field="navio" />
                  </div>
                </TableHead>
                <TableHead>NV</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("eta")}
                >
                  ETA
                  <SortIcon field="eta" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("armador")}
                >
                  Armador
                  <SortIcon field="armador" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted text-center"
                  onClick={() => handleSort("total_cntr")}
                >
                  Total
                  <SortIcon field="total_cntr" />
                </TableHead>
                <TableHead className="text-center">20'</TableHead>
                <TableHead className="text-center">40'</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted text-center"
                  onClick={() => handleSort("total_clientes")}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Clientes
                    <SortIcon field="total_clientes" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Intermarítima</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNavios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhum navio encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredNavios.map((navio, index) => (
                  <TableRow 
                    key={`${navio.navio}-${navio.nv}-${index}`}
                    className={cn(
                      "hover:bg-muted/50 cursor-pointer",
                      navio.total_cntr >= 50 && "bg-red-50/50"
                    )}
                    onClick={() => onNavioClick(navio)}
                  >
                    <TableCell className="font-medium">{navio.navio}</TableCell>
                    <TableCell>{navio.nv || "-"}</TableCell>
                    <TableCell>
                      {navio.eta 
                        ? format(new Date(navio.eta), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{navio.armador || "-"}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("px-2 py-1 rounded", getVolumeClass(navio.total_cntr))}>
                        {navio.total_cntr}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {navio.cntr_20 > 0 ? (
                        <Badge variant="outline" className="text-xs">{navio.cntr_20}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {navio.cntr_40 > 0 ? (
                        <Badge variant="outline" className="text-xs">{navio.cntr_40}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{navio.total_clientes}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          {navio.clientes_intermaritima}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="flex items-center gap-1 text-orange-600">
                          <XCircle className="h-4 w-4" />
                          {navio.clientes_nao_cadastrados}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavioClick(navio);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNavioToDelete(navio);
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
        </div>
      </div>

      <AlertDialog open={!!navioToDelete} onOpenChange={(open) => !open && setNavioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Navio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o navio <strong>{navioToDelete?.navio}</strong> e todos os seus registros?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteNavio}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
