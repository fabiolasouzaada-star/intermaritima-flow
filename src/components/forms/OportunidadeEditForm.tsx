import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateOportunidade, type Oportunidade } from "@/hooks/useOportunidades";
import type { Database } from "@/integrations/supabase/types";

type StatusOportunidade = Database["public"]["Enums"]["status_oportunidade"];

interface OportunidadeEditFormProps {
  oportunidade: Oportunidade;
  onSuccess?: () => void;
}

export function OportunidadeEditForm({ oportunidade, onSuccess }: OportunidadeEditFormProps) {
  const [titulo, setTitulo] = useState(oportunidade.titulo);
  const [descricao, setDescricao] = useState(oportunidade.descricao || "");
  const [valor, setValor] = useState(oportunidade.valor?.toString() || "");
  const [probabilidade, setProbabilidade] = useState(oportunidade.probabilidade?.toString() || "");
  const [previsaoFechamento, setPrevisaoFechamento] = useState(oportunidade.previsao_fechamento || "");
  const [status, setStatus] = useState<StatusOportunidade>(oportunidade.status);

  const updateOportunidade = useUpdateOportunidade();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateOportunidade.mutateAsync({
      id: oportunidade.id,
      data: {
        titulo,
        descricao: descricao || null,
        valor: valor ? parseFloat(valor) : null,
        probabilidade: probabilidade ? parseInt(probabilidade) : null,
        previsao_fechamento: previsaoFechamento || null,
        status,
      }
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

      <Button type="submit" className="w-full" disabled={updateOportunidade.isPending}>
        {updateOportunidade.isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
