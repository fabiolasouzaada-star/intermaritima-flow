import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePlanoAcao, type StatusAcao, type PrioridadeAcao, type TipoServicoAcao } from "@/hooks/usePlanoAcoes";
import { useClientes } from "@/hooks/useClientes";
import { useProfiles } from "@/hooks/useProfiles";
import { Loader2, Search } from "lucide-react";

const TIPOS_SERVICO: { value: TipoServicoAcao; label: string }[] = [
  { value: "ALF", label: "ALF - Alfandegado" },
  { value: "TR", label: "TR - Transporte" },
  { value: "AG", label: "AG - Armazém Geral" },
  { value: "OP", label: "OP - Operação" },
  { value: "EXP", label: "EXP - Exportação" },
];

interface PlanoAcaoFormProps {
  clienteId?: string;
  onSuccess?: () => void;
}

export function PlanoAcaoForm({ clienteId, onSuccess }: PlanoAcaoFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState(clienteId || "");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<StatusAcao>("qualificacao");
  const [prioridade, setPrioridade] = useState<PrioridadeAcao>("media");
  const [tipoServico, setTipoServico] = useState<TipoServicoAcao | "">("");
  const [dataLimite, setDataLimite] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clientes, isLoading: isLoadingClientes } = useClientes();
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const createAcao = useCreatePlanoAcao();

  const filteredClientes = useMemo(() => {
    if (!clientes) return [];
    if (!searchTerm) return clientes.slice(0, 50);
    return clientes
      .filter((c) => c.empresa.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 50);
  }, [clientes, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createAcao.mutateAsync({
      cliente_id: selectedClienteId,
      titulo,
      descricao: descricao || undefined,
      status,
      prioridade,
      tipo_servico: tipoServico || undefined,
      data_limite: dataLimite || undefined,
      responsavel_id: responsavelId || undefined,
      observacoes: observacoes || undefined,
    });

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!clienteId && (
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClienteId} onValueChange={setSelectedClienteId} required>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingClientes ? "Carregando..." : "Selecione o cliente"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {isLoadingClientes ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : filteredClientes.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              ) : (
                filteredClientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.empresa}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Negociação de novo contrato"
          required
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva a ação..."
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

      <Button type="submit" className="w-full" disabled={createAcao.isPending}>
        {createAcao.isPending ? "Criando..." : "Criar Ação"}
      </Button>
    </form>
  );
}
