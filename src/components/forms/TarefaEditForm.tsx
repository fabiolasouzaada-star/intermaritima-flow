import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTarefa, type Tarefa } from "@/hooks/useTarefas";
import type { Database } from "@/integrations/supabase/types";

type PrioridadeTarefa = Database["public"]["Enums"]["prioridade_tarefa"];
type StatusTarefa = Database["public"]["Enums"]["status_tarefa"];

interface TarefaEditFormProps {
  tarefa: Tarefa;
  onSuccess?: () => void;
}

export function TarefaEditForm({ tarefa, onSuccess }: TarefaEditFormProps) {
  const [titulo, setTitulo] = useState(tarefa.titulo);
  const [descricao, setDescricao] = useState(tarefa.descricao || "");
  const [dataVencimento, setDataVencimento] = useState(tarefa.data_vencimento || "");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>(tarefa.prioridade);
  const [status, setStatus] = useState<StatusTarefa>(tarefa.status);
  const [responsavelNome, setResponsavelNome] = useState(tarefa.responsavel_nome || "");

  const updateTarefa = useUpdateTarefa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateTarefa.mutateAsync({
      id: tarefa.id,
      data: {
        titulo,
        descricao: descricao || null,
        data_vencimento: dataVencimento || null,
        prioridade,
        status,
        responsavel_nome: responsavelNome || null,
      },
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tarefa.clientes && (
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-xs text-muted-foreground">Cliente</Label>
          <p className="font-medium">{tarefa.clientes.empresa}</p>
        </div>
      )}

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

      <div>
        <Label htmlFor="responsavel">Responsável</Label>
        <Input
          id="responsavel"
          value={responsavelNome}
          onChange={(e) => setResponsavelNome(e.target.value)}
          placeholder="Digite o nome do responsável"
        />
      </div>

      <Button type="submit" className="w-full" disabled={updateTarefa.isPending}>
        {updateTarefa.isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
