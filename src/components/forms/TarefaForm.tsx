import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTarefa, type TarefaInsert } from "@/hooks/useTarefas";
import { useClientes } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";

type PrioridadeTarefa = Database["public"]["Enums"]["prioridade_tarefa"];
type StatusTarefa = Database["public"]["Enums"]["status_tarefa"];

interface TarefaFormProps {
  clienteId?: string;
  onSuccess?: () => void;
}

export function TarefaForm({ clienteId, onSuccess }: TarefaFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("media");
  const [status, setStatus] = useState<StatusTarefa>("pendente");

  const { data: clientes } = useClientes();
  const createTarefa = useCreateTarefa();

  useEffect(() => {
    if (clienteId) {
      setSelectedClienteId(clienteId);
    }
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTarefa.mutateAsync({
      titulo,
      descricao: descricao || undefined,
      cliente_id: selectedClienteId || undefined,
      data_vencimento: dataVencimento || undefined,
      prioridade,
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

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
        />
      </div>

      {!clienteId && (
        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente (opcional)" />
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
        <Label htmlFor="data">Data de Vencimento</Label>
        <Input
          id="data"
          type="date"
          value={dataVencimento}
          onChange={(e) => setDataVencimento(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="prioridade">Prioridade *</Label>
        <Select value={prioridade} onValueChange={(value) => setPrioridade(value as PrioridadeTarefa)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusTarefa)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={createTarefa.isPending}>
        {createTarefa.isPending ? "Criando..." : "Criar Tarefa"}
      </Button>
    </form>
  );
}