import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateVisita, type Visita } from "@/hooks/useVisitas";
import type { Database } from "@/integrations/supabase/types";

type StatusVisita = Database["public"]["Enums"]["status_visita"];

interface VisitaEditFormProps {
  visita: Visita;
  onSuccess?: () => void;
}

export function VisitaEditForm({ visita, onSuccess }: VisitaEditFormProps) {
  // Formata a data para o input datetime-local no timezone local
  const formatToLocalDatetime = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [dataVisita, setDataVisita] = useState(
    visita.data_visita ? formatToLocalDatetime(visita.data_visita) : ""
  );
  const [modalidade, setModalidade] = useState<"presencial" | "remota">(
    (visita as any).modalidade || "presencial"
  );
  const [objetivo, setObjetivo] = useState(visita.objetivo || "");
  const [situacaoAtual, setSituacaoAtual] = useState(visita.situacao_atual || "");
  const [oportunidades, setOportunidades] = useState(visita.oportunidades_identificadas || "");
  const [dores, setDores] = useState(visita.dores_percebidas || "");
  const [proximosPassos, setProximosPassos] = useState(visita.proximos_passos || "");
  const [status, setStatus] = useState<StatusVisita>(visita.status);

  const updateVisita = useUpdateVisita();

  // Converte datetime-local para ISO com timezone local
  const toLocalISOString = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateVisita.mutateAsync({
      id: visita.id,
      data: {
        data_visita: toLocalISOString(dataVisita),
        modalidade,
        objetivo: objetivo || null,
        situacao_atual: situacaoAtual || null,
        oportunidades_identificadas: oportunidades || null,
        dores_percebidas: dores || null,
        proximos_passos: proximosPassos || null,
        status,
      },
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-muted rounded-lg">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <p className="font-medium">{visita.clientes?.empresa || "Cliente não informado"}</p>
      </div>

      <div>
        <Label htmlFor="data">Data da Visita/Reunião *</Label>
        <Input
          id="data"
          type="datetime-local"
          value={dataVisita}
          onChange={(e) => setDataVisita(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="modalidade">Modalidade *</Label>
          <Select value={modalidade} onValueChange={(value) => setModalidade(value as "presencial" | "remota")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="remota">Remota</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as StatusVisita)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a_agendar">A Agendar</SelectItem>
              <SelectItem value="agendada">Agendada</SelectItem>
              <SelectItem value="realizada">Realizada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="objetivo">Objetivo</Label>
        <Textarea
          id="objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="situacao">Situação Atual</Label>
        <Textarea
          id="situacao"
          value={situacaoAtual}
          onChange={(e) => setSituacaoAtual(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="oportunidades">Oportunidades Identificadas</Label>
        <Textarea
          id="oportunidades"
          value={oportunidades}
          onChange={(e) => setOportunidades(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="dores">Dores Percebidas</Label>
        <Textarea
          id="dores"
          value={dores}
          onChange={(e) => setDores(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="proximos">Próximos Passos</Label>
        <Textarea
          id="proximos"
          value={proximosPassos}
          onChange={(e) => setProximosPassos(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={updateVisita.isPending}>
        {updateVisita.isPending ? "Salvando..." : "Salvar Visita/Reunião"}
      </Button>
    </form>
  );
}
