import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContrato, type ContratoInsert } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";

type StatusContrato = Database["public"]["Enums"]["status_contrato"];

interface ContratoFormProps {
  clienteId?: string;
  onSuccess?: () => void;
}

export function ContratoForm({ clienteId, onSuccess }: ContratoFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<StatusContrato>("ativo");

  const { data: clientes } = useClientes();
  const createContrato = useCreateContrato();

  useEffect(() => {
    if (clienteId) {
      setSelectedClienteId(clienteId);
    }
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createContrato.mutateAsync({
      numero_contrato: numeroContrato,
      cliente_id: selectedClienteId,
      data_inicio: dataInicio,
      data_fim: dataFim || undefined,
      valor_total: parseFloat(valorTotal),
      status,
      observacoes: observacoes || undefined,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="numero">Número do Contrato *</Label>
        <Input
          id="numero"
          value={numeroContrato}
          onChange={(e) => setNumeroContrato(e.target.value)}
          required
        />
      </div>

      {!clienteId && (
        <div>
          <Label htmlFor="cliente">Cliente *</Label>
          <Select value={selectedClienteId} onValueChange={setSelectedClienteId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="inicio">Data de Início *</Label>
        <Input
          id="inicio"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="fim">Data de Término</Label>
        <Input
          id="fim"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="valor">Valor Total (R$) *</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={valorTotal}
          onChange={(e) => setValorTotal(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusContrato)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
            <SelectItem value="renovacao">Renovação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={createContrato.isPending}>
        {createContrato.isPending ? "Criando..." : "Criar Contrato"}
      </Button>
    </form>
  );
}