import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfiles } from "@/hooks/useProfiles";
import { 
  useCreateAcaoReuniao,
  PRIORIDADES_ACAO,
  STATUS_ACAO,
  IMPACTOS_ACAO,
  type PrioridadeAcaoReuniao,
  type StatusAcaoReuniao,
  type ImpactoAcao
} from "@/hooks/useAcoesReuniao";
import { AREAS_ENVOLVIDAS, type AreaEnvolvida } from "@/hooks/useReunioes";

interface AcaoReuniaoFormProps {
  reuniaoId: string;
  clienteId?: string | null;
  onSuccess?: () => void;
}

export function AcaoReuniaoForm({ reuniaoId, clienteId, onSuccess }: AcaoReuniaoFormProps) {
  const [acao, setAcao] = useState("");
  const [areaResponsavel, setAreaResponsavel] = useState<AreaEnvolvida>("comercial");
  const [responsavelId, setResponsavelId] = useState("");
  const [prazo, setPrazo] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadeAcaoReuniao>("media");
  const [status, setStatus] = useState<StatusAcaoReuniao>("nao_iniciada");
  const [impacto, setImpacto] = useState<ImpactoAcao | "">("");
  const [comentarios, setComentarios] = useState("");

  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const createAcao = useCreateAcaoReuniao();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createAcao.mutateAsync({
      reuniao_id: reuniaoId,
      cliente_id: clienteId,
      acao,
      area_responsavel: areaResponsavel,
      responsavel_id: responsavelId || null,
      prazo: prazo || null,
      prioridade,
      status,
      impacto: impacto || null,
      comentarios: comentarios || undefined,
    });

    // Reset form
    setAcao("");
    setAreaResponsavel("comercial");
    setResponsavelId("");
    setPrazo("");
    setPrioridade("media");
    setStatus("nao_iniciada");
    setImpacto("");
    setComentarios("");

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="acao">Ação (inicie com verbo) *</Label>
        <Input
          id="acao"
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          placeholder="Ex: Enviar proposta comercial, Agendar visita técnica..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area">Área Responsável *</Label>
          <Select value={areaResponsavel} onValueChange={(v) => setAreaResponsavel(v as AreaEnvolvida)}>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="prazo">Prazo</Label>
          <Input
            id="prazo"
            type="date"
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="prioridade">Prioridade *</Label>
          <Select value={prioridade} onValueChange={(v) => setPrioridade(v as PrioridadeAcaoReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORIDADES_ACAO.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusAcaoReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ACAO.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="impacto">Impacto</Label>
        <Select value={impacto} onValueChange={(v) => setImpacto(v as ImpactoAcao)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de impacto" />
          </SelectTrigger>
          <SelectContent>
            {IMPACTOS_ACAO.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="comentarios">Comentários</Label>
        <Textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={3}
          placeholder="Observações adicionais sobre a ação"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createAcao.isPending}>
        {createAcao.isPending ? "Criando..." : "Criar Ação"}
      </Button>
    </form>
  );
}
