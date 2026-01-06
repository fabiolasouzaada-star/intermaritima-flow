import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdatePlanoAcao, type PlanoAcao, type StatusAcao, type PrioridadeAcao } from "@/hooks/usePlanoAcoes";
import { useProfiles } from "@/hooks/useProfiles";

interface PlanoAcaoEditFormProps {
  acao: PlanoAcao;
  onSuccess?: () => void;
}

export function PlanoAcaoEditForm({ acao, onSuccess }: PlanoAcaoEditFormProps) {
  const [titulo, setTitulo] = useState(acao.titulo);
  const [descricao, setDescricao] = useState(acao.descricao || "");
  const [status, setStatus] = useState<StatusAcao>(acao.status);
  const [prioridade, setPrioridade] = useState<PrioridadeAcao>(acao.prioridade);
  const [dataLimite, setDataLimite] = useState(acao.data_limite || "");
  const [responsavelId, setResponsavelId] = useState(acao.responsavel_id || "");
  const [observacoes, setObservacoes] = useState(acao.observacoes || "");

  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const updateAcao = useUpdatePlanoAcao();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateAcao.mutateAsync({
      id: acao.id,
      data: {
        titulo,
        descricao: descricao || null,
        status,
        prioridade,
        data_limite: dataLimite || null,
        responsavel_id: responsavelId || null,
        observacoes: observacoes || null,
      },
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-muted rounded-lg">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <p className="font-medium">{acao.clientes?.empresa || "Cliente não informado"}</p>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusAcao)}>
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
          <Label htmlFor="prioridade">Prioridade</Label>
          <Select value={prioridade} onValueChange={(v) => setPrioridade(v as PrioridadeAcao)}>
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
      </div>

      <div>
        <Label htmlFor="data_limite">Prazo</Label>
        <Input
          id="data_limite"
          type="date"
          value={dataLimite}
          onChange={(e) => setDataLimite(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="responsavel">Responsável</Label>
        <Select value={responsavelId} onValueChange={setResponsavelId}>
          <SelectTrigger>
            <SelectValue placeholder={isLoadingProfiles ? "Carregando..." : "Selecione"} />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={updateAcao.isPending}>
        {updateAcao.isPending ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
