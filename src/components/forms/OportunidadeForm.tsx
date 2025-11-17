import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOportunidade, type OportunidadeInsert } from "@/hooks/useOportunidades";
import { useClientes } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";

type StatusOportunidade = Database["public"]["Enums"]["status_oportunidade"];

interface OportunidadeFormProps {
  clienteId?: string;
  onSuccess?: () => void;
}

export function OportunidadeForm({ clienteId, onSuccess }: OportunidadeFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [probabilidade, setProbabilidade] = useState("");
  const [previsaoFechamento, setPrevisaoFechamento] = useState("");
  const [status, setStatus] = useState<StatusOportunidade>("qualificacao");

  const { data: clientes } = useClientes();
  const createOportunidade = useCreateOportunidade();

  useEffect(() => {
    if (clienteId) {
      setSelectedClienteId(clienteId);
    }
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createOportunidade.mutateAsync({
      titulo,
      cliente_id: selectedClienteId,
      descricao: descricao || undefined,
      valor: valor ? parseFloat(valor) : undefined,
      probabilidade: probabilidade ? parseInt(probabilidade) : undefined,
      previsao_fechamento: previsaoFechamento || undefined,
      status,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
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
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="probabilidade">Probabilidade (%)</Label>
        <Input
          id="probabilidade"
          type="number"
          min="0"
          max="100"
          value={probabilidade}
          onChange={(e) => setProbabilidade(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="previsao">Previsão de Fechamento</Label>
        <Input
          id="previsao"
          type="date"
          value={previsaoFechamento}
          onChange={(e) => setPrevisaoFechamento(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusOportunidade)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="qualificacao">Qualificação</SelectItem>
            <SelectItem value="proposta">Proposta</SelectItem>
            <SelectItem value="negociacao">Negociação</SelectItem>
            <SelectItem value="fechamento">Fechamento</SelectItem>
            <SelectItem value="ganho">Ganho</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={createOportunidade.isPending}>
        {createOportunidade.isPending ? "Criando..." : "Criar Oportunidade"}
      </Button>
    </form>
  );
}