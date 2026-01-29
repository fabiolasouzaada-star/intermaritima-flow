import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfiles } from "@/hooks/useProfiles";
import { 
  useCreateTarefaAcao,
  STATUS_TAREFA_ACAO,
  type StatusTarefaAcao
} from "@/hooks/useTarefasAcao";

interface TarefaAcaoFormProps {
  acaoId: string;
  onSuccess?: () => void;
}

export function TarefaAcaoForm({ acaoId, onSuccess }: TarefaAcaoFormProps) {
  const [descricao, setDescricao] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [status, setStatus] = useState<StatusTarefaAcao>("nao_iniciada");
  const [slaHoras, setSlaHoras] = useState("");
  const [comentarios, setComentarios] = useState("");

  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const createTarefa = useCreateTarefaAcao();

  const toLocalISOString = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createTarefa.mutateAsync({
      acao_id: acaoId,
      descricao,
      responsavel_id: responsavelId || null,
      data_inicio: dataInicio ? toLocalISOString(dataInicio) : null,
      data_final: dataFinal ? toLocalISOString(dataFinal) : null,
      status,
      sla_horas: slaHoras ? parseInt(slaHoras) : null,
      comentarios: comentarios || undefined,
    });

    // Reset form
    setDescricao("");
    setResponsavelId("");
    setDataInicio("");
    setDataFinal("");
    setStatus("nao_iniciada");
    setSlaHoras("");
    setComentarios("");

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="descricao">Descrição da Tarefa *</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Descreva a tarefa a ser executada"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsavel">Responsável</Label>
          <Select value={responsavelId || "none"} onValueChange={(v) => setResponsavelId(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingProfiles ? "Carregando..." : "Selecione"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {profiles?.filter((p) => p.id && p.id.trim() !== "").map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusTarefaAcao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_TAREFA_ACAO.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_inicio">Data/Hora de Início</Label>
          <Input
            id="data_inicio"
            type="datetime-local"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="data_final">Data/Hora Final (Prazo)</Label>
          <Input
            id="data_final"
            type="datetime-local"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="sla">SLA em Horas</Label>
        <Input
          id="sla"
          type="number"
          min="0"
          value={slaHoras}
          onChange={(e) => setSlaHoras(e.target.value)}
          placeholder="Ex: 24"
        />
      </div>

      <div>
        <Label htmlFor="comentarios">Comentários</Label>
        <Textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={2}
          placeholder="Observações adicionais"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createTarefa.isPending}>
        {createTarefa.isPending ? "Criando..." : "Criar Tarefa"}
      </Button>
    </form>
  );
}
