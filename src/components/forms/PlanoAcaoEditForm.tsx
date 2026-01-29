import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdatePlanoAcao, type PlanoAcao, type StatusAcao, type PrioridadeAcao, type TipoServicoAcao } from "@/hooks/usePlanoAcoes";
import { useProfiles } from "@/hooks/useProfiles";

const TIPOS_SERVICO: { value: TipoServicoAcao; label: string }[] = [
  { value: "ALF", label: "ALF - Alfandegado" },
  { value: "TR", label: "TR - Transporte" },
  { value: "AG", label: "AG - Armazém Geral" },
  { value: "OP", label: "OP - Operação" },
  { value: "EXP", label: "EXP - Exportação" },
];

interface PlanoAcaoEditFormProps {
  acao: PlanoAcao;
  onSuccess?: () => void;
}

export function PlanoAcaoEditForm({ acao, onSuccess }: PlanoAcaoEditFormProps) {
  const [titulo, setTitulo] = useState(acao.titulo);
  const [descricao, setDescricao] = useState(acao.descricao || "");
  const [status, setStatus] = useState<StatusAcao>(acao.status);
  const [prioridade, setPrioridade] = useState<PrioridadeAcao>(acao.prioridade);
  const [tipoServico, setTipoServico] = useState<TipoServicoAcao | "">(acao.tipo_servico || "");
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
        tipo_servico: tipoServico || null,
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

      <div>
        <Label htmlFor="tipo_servico">Tipo de Serviço</Label>
        <Select value={tipoServico} onValueChange={(v) => setTipoServico(v as TipoServicoAcao)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_SERVICO.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusAcao)}>
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
              <SelectItem value="sem_retorno">Sem Retorno</SelectItem>
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
