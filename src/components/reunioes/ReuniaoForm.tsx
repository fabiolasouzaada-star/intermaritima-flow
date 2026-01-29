import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientes } from "@/hooks/useClientes";
import { 
  useCreateReuniao, 
  TIPOS_REUNIAO, 
  AREAS_ENVOLVIDAS, 
  STATUS_REUNIAO,
  type TipoReuniao,
  type AreaEnvolvida,
  type StatusReuniao
} from "@/hooks/useReunioes";

interface ReuniaoFormProps {
  onSuccess?: () => void;
}

export function ReuniaoForm({ onSuccess }: ReuniaoFormProps) {
  const [dataReuniao, setDataReuniao] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [tipo, setTipo] = useState<TipoReuniao>("comercial");
  const [areaEnvolvida, setAreaEnvolvida] = useState<AreaEnvolvida>("comercial");
  const [participantes, setParticipantes] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [resumo, setResumo] = useState("");
  const [status, setStatus] = useState<StatusReuniao>("em_andamento");
  const [proximaReuniao, setProximaReuniao] = useState("");
  const [observacoesEstrategicas, setObservacoesEstrategicas] = useState("");
  const [clienteOpen, setClienteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clientes, isLoading: isLoadingClientes } = useClientes();
  const createReuniao = useCreateReuniao();

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    return clientes
      .filter((c) =>
        c.empresa.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 50);
  }, [clientes, searchTerm]);

  const toLocalISOString = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createReuniao.mutateAsync({
      data_reuniao: toLocalISOString(dataReuniao),
      cliente_id: selectedClienteId || null,
      tipo,
      area_envolvida: areaEnvolvida,
      participantes: participantes || undefined,
      objetivo: objetivo || undefined,
      resumo: resumo || undefined,
      status,
      proxima_reuniao: proximaReuniao ? toLocalISOString(proximaReuniao) : null,
      observacoes_estrategicas: observacoesEstrategicas || undefined,
    });

    // Reset form
    setDataReuniao("");
    setSelectedClienteId("");
    setTipo("comercial");
    setAreaEnvolvida("comercial");
    setParticipantes("");
    setObjetivo("");
    setResumo("");
    setStatus("em_andamento");
    setProximaReuniao("");
    setObservacoesEstrategicas("");

    onSuccess?.();
  };

  const selectedCliente = clientes?.find((c) => c.id === selectedClienteId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_reuniao">Data e Hora da Reunião *</Label>
          <Input
            id="data_reuniao"
            type="datetime-local"
            value={dataReuniao}
            onChange={(e) => setDataReuniao(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clienteOpen}
                className="w-full justify-between"
              >
                {selectedCliente?.empresa || "Selecione um cliente..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoadingClientes ? "Carregando..." : "Nenhum cliente encontrado."}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredClientes.map((cliente) => (
                      <CommandItem
                        key={cliente.id}
                        value={cliente.empresa}
                        onSelect={() => {
                          setSelectedClienteId(cliente.id);
                          setClienteOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClienteId === cliente.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {cliente.empresa}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Reunião *</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_REUNIAO.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="area">Área Envolvida *</Label>
          <Select value={areaEnvolvida} onValueChange={(v) => setAreaEnvolvida(v as AreaEnvolvida)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AREAS_ENVOLVIDAS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_REUNIAO.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="participantes">Participantes</Label>
        <Input
          id="participantes"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
          placeholder="Nomes dos participantes separados por vírgula"
        />
      </div>

      <div>
        <Label htmlFor="objetivo">Objetivo da Reunião</Label>
        <Textarea
          id="objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          rows={2}
          placeholder="Descreva o objetivo principal da reunião"
        />
      </div>

      <div>
        <Label htmlFor="resumo">Resumo da Reunião</Label>
        <Textarea
          id="resumo"
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          rows={4}
          placeholder="Resumo dos pontos discutidos e decisões tomadas"
        />
      </div>

      <div>
        <Label htmlFor="proxima_reuniao">Próxima Reunião</Label>
        <Input
          id="proxima_reuniao"
          type="datetime-local"
          value={proximaReuniao}
          onChange={(e) => setProximaReuniao(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações Estratégicas</Label>
        <Textarea
          id="observacoes"
          value={observacoesEstrategicas}
          onChange={(e) => setObservacoesEstrategicas(e.target.value)}
          rows={3}
          placeholder="Observações importantes e insights estratégicos"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createReuniao.isPending}>
        {createReuniao.isPending ? "Registrando..." : "Registrar Reunião"}
      </Button>
    </form>
  );
}
