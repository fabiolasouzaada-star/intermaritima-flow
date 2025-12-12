import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateVisita, type VisitaInsert } from "@/hooks/useVisitas";
import { useClientes } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, Search } from "lucide-react";

type StatusVisita = Database["public"]["Enums"]["status_visita"];

interface VisitaFormProps {
  clienteId?: string;
  onSuccess?: () => void;
}

export function VisitaForm({ clienteId, onSuccess }: VisitaFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [dataVisita, setDataVisita] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [situacaoAtual, setSituacaoAtual] = useState("");
  const [oportunidades, setOportunidades] = useState("");
  const [dores, setDores] = useState("");
  const [proximosPassos, setProximosPassos] = useState("");
  const [status, setStatus] = useState<StatusVisita>("agendada");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clientes, isLoading: isLoadingClientes } = useClientes();
  const createVisita = useCreateVisita();

  useEffect(() => {
    if (clienteId) {
      setSelectedClienteId(clienteId);
    }
  }, [clienteId]);

  // Filtrar clientes para melhor performance
  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    if (!searchTerm) return clientes.slice(0, 50); // Limita a 50 inicialmente
    return clientes.filter(c => 
      c.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50);
  }, [clientes, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createVisita.mutateAsync({
      cliente_id: selectedClienteId,
      data_visita: dataVisita,
      objetivo: objetivo || undefined,
      situacao_atual: situacaoAtual || undefined,
      oportunidades_identificadas: oportunidades || undefined,
      dores_percebidas: dores || undefined,
      proximos_passos: proximosPassos || undefined,
      status,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!clienteId && (
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClienteId} onValueChange={setSelectedClienteId} required>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingClientes ? "Carregando..." : "Selecione o cliente"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {isLoadingClientes ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : filteredClientes.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              ) : (
                filteredClientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.empresa}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="data">Data da Visita *</Label>
        <Input
          id="data"
          type="datetime-local"
          value={dataVisita}
          onChange={(e) => setDataVisita(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusVisita)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="objetivo">Objetivo</Label>
        <Textarea
          id="objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="situacao">Situação Atual</Label>
        <Textarea
          id="situacao"
          value={situacaoAtual}
          onChange={(e) => setSituacaoAtual(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="oportunidades">Oportunidades Identificadas</Label>
        <Textarea
          id="oportunidades"
          value={oportunidades}
          onChange={(e) => setOportunidades(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="dores">Dores Percebidas</Label>
        <Textarea
          id="dores"
          value={dores}
          onChange={(e) => setDores(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="proximos">Próximos Passos</Label>
        <Textarea
          id="proximos"
          value={proximosPassos}
          onChange={(e) => setProximosPassos(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={createVisita.isPending}>
        {createVisita.isPending ? "Criando..." : "Criar Visita"}
      </Button>
    </form>
  );
}