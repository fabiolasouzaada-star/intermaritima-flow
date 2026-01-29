import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  useCreateReuniao, 
  TIPOS_REUNIAO, 
  AREAS_ENVOLVIDAS, 
  STATUS_REUNIAO,
  type TipoReuniao,
  type AreaEnvolvida,
  type StatusReuniao
} from "@/hooks/useReunioes";

interface ReuniaoFormProps {
  onSuccess?: () => void;
}

export function ReuniaoForm({ onSuccess }: ReuniaoFormProps) {
  const [dataReuniao, setDataReuniao] = useState("");
  const [tipo, setTipo] = useState<TipoReuniao>("comercial");
  const [areasEnvolvidas, setAreasEnvolvidas] = useState<string[]>(["comercial"]);
  const [participantes, setParticipantes] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [resumo, setResumo] = useState("");
  const [status, setStatus] = useState<StatusReuniao>("em_andamento");
  const [proximaReuniao, setProximaReuniao] = useState("");
  const [observacoesEstrategicas, setObservacoesEstrategicas] = useState("");

  const createReuniao = useCreateReuniao();

  const toLocalISOString = (dateTimeLocal: string): string => {
    const date = new Date(dateTimeLocal);
    return date.toISOString();
  };

  const toggleArea = (area: string) => {
    setAreasEnvolvidas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (areasEnvolvidas.length === 0) {
      return;
    }

    await createReuniao.mutateAsync({
      data_reuniao: toLocalISOString(dataReuniao),
      tipo,
      area_envolvida: areasEnvolvidas[0] as AreaEnvolvida,
      areas_envolvidas: areasEnvolvidas,
      participantes: participantes || undefined,
      objetivo: objetivo || undefined,
      resumo: resumo || undefined,
      status,
      proxima_reuniao: proximaReuniao ? toLocalISOString(proximaReuniao) : null,
      observacoes_estrategicas: observacoesEstrategicas || undefined,
    });

    // Reset form
    setDataReuniao("");
    setTipo("comercial");
    setAreasEnvolvidas(["comercial"]);
    setParticipantes("");
    setObjetivo("");
    setResumo("");
    setStatus("em_andamento");
    setProximaReuniao("");
    setObservacoesEstrategicas("");

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="data_reuniao">Data e Hora da Reunião *</Label>
        <Input
          id="data_reuniao"
          type="datetime-local"
          value={dataReuniao}
          onChange={(e) => setDataReuniao(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Reunião *</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v as TipoReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_REUNIAO.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusReuniao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_REUNIAO.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Áreas Envolvidas * (selecione uma ou mais)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 p-3 border rounded-md bg-muted/20">
          {AREAS_ENVOLVIDAS.map((area) => (
            <div key={area.value} className="flex items-center space-x-2">
              <Checkbox
                id={`area-${area.value}`}
                checked={areasEnvolvidas.includes(area.value)}
                onCheckedChange={() => toggleArea(area.value)}
              />
              <label
                htmlFor={`area-${area.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {area.label}
              </label>
            </div>
          ))}
        </div>
        {areasEnvolvidas.length === 0 && (
          <p className="text-xs text-destructive mt-1">Selecione pelo menos uma área</p>
        )}
      </div>

      <div>
        <Label htmlFor="participantes">Participantes</Label>
        <Input
          id="participantes"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
          placeholder="Nomes dos participantes separados por vírgula"
        />
      </div>

      <div>
        <Label htmlFor="objetivo">Objetivo da Reunião</Label>
        <Textarea
          id="objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          rows={2}
          placeholder="Descreva o objetivo principal da reunião"
        />
      </div>

      <div>
        <Label htmlFor="resumo">Resumo da Reunião</Label>
        <Textarea
          id="resumo"
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          rows={4}
          placeholder="Resumo dos pontos discutidos e decisões tomadas"
        />
      </div>

      <div>
        <Label htmlFor="proxima_reuniao">Próxima Reunião</Label>
        <Input
          id="proxima_reuniao"
          type="datetime-local"
          value={proximaReuniao}
          onChange={(e) => setProximaReuniao(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações Estratégicas</Label>
        <Textarea
          id="observacoes"
          value={observacoesEstrategicas}
          onChange={(e) => setObservacoesEstrategicas(e.target.value)}
          rows={3}
          placeholder="Observações importantes e insights estratégicos"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createReuniao.isPending}>
        {createReuniao.isPending ? "Registrando..." : "Registrar Reunião"}
      </Button>
    </form>
  );
}
