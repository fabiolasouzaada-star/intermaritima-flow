import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useUpdateAcaoReuniao, 
  useDeleteAcaoReuniao,
  STATUS_ACAO, 
  PRIORIDADES_ACAO, 
  IMPACTOS_ACAO,
  AREAS_RESPONSAVEL,
  type AcaoReuniao,
  type StatusAcaoReuniao,
  type PrioridadeAcaoReuniao,
  type ImpactoAcao
} from "@/hooks/useAcoesReuniao";
import { type AreaEnvolvida } from "@/hooks/useReunioes";
import { useProfiles } from "@/hooks/useProfiles";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AcaoReuniaoEditFormProps {
  acao: AcaoReuniao;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AcaoReuniaoEditForm({ acao, onSuccess, onCancel }: AcaoReuniaoEditFormProps) {
  const [acaoText, setAcaoText] = useState(acao.acao);
  const [areaResponsavel, setAreaResponsavel] = useState<AreaEnvolvida>(acao.area_responsavel);
  const [responsavelId, setResponsavelId] = useState(acao.responsavel_id || "");
  const [prazo, setPrazo] = useState(acao.prazo || "");
  const [prioridade, setPrioridade] = useState<PrioridadeAcaoReuniao>(acao.prioridade);
  const [status, setStatus] = useState<StatusAcaoReuniao>(acao.status);
  const [impacto, setImpacto] = useState<ImpactoAcao | "">(acao.impacto || "");
  const [comentarios, setComentarios] = useState(acao.comentarios || "");
  const [dataConclusao, setDataConclusao] = useState(acao.data_conclusao || "");

  const { data: profiles } = useProfiles();
  const updateAcao = useUpdateAcaoReuniao();
  const deleteAcao = useDeleteAcaoReuniao();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateAcao.mutateAsync({
      id: acao.id,
      data: {
        acao: acaoText,
        area_responsavel: areaResponsavel,
        responsavel_id: responsavelId || null,
        prazo: prazo || null,
        prioridade,
        status,
        impacto: impacto || null,
        comentarios: comentarios || null,
        data_conclusao: dataConclusao || null,
      },
    });

    onSuccess?.();
  };

  const handleDelete = async () => {
    await deleteAcao.mutateAsync(acao.id);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="acao">Ação *</Label>
        <Input
          id="acao"
          value={acaoText}
          onChange={(e) => setAcaoText(e.target.value)}
          placeholder="Ex: Enviar proposta comercial"
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
              {AREAS_RESPONSAVEL.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="responsavel">Responsável</Label>
          <Select value={responsavelId || "none"} onValueChange={(v) => setResponsavelId(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {profiles?.filter((p) => p.id && p.id.trim() !== "").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="impacto">Impacto</Label>
          <Select value={impacto || "none"} onValueChange={(v) => setImpacto(v === "none" ? "" : v as ImpactoAcao)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {IMPACTOS_ACAO.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data_conclusao">Data de Conclusão</Label>
          <Input
            id="data_conclusao"
            type="date"
            value={dataConclusao}
            onChange={(e) => setDataConclusao(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="comentarios">Comentários</Label>
        <Textarea
          id="comentarios"
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={3}
          placeholder="Observações adicionais..."
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={updateAcao.isPending}>
          {updateAcao.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Ação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
}
