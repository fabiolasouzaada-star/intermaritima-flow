import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCliente, type ClienteInsert } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { SEGMENTOS } from "@/constants/segmentos";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

type StatusCliente = Database["public"]["Enums"]["status_cliente"];

interface Proposta {
  id: string;
  numero_proposta: string;
  servico: string;
  data_proposta: string;
  vencimento_proposta: string;
  file: File | null;
}

const SERVICOS_PROPOSTA = [
  "AG (Armazém Geral)",
  "Transporte",
  "Alfandegado",
  "Operação Portuária",
  "Exportação",
];

interface ClienteFormProps {
  onSuccess?: () => void;
}

export function ClienteForm({ onSuccess }: ClienteFormProps) {
  const [empresa, setEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segmentos, setSegmentos] = useState<string[]>([]);
  const [segmentoSearch, setSegmentoSearch] = useState("");
  const [openSegmentos, setOpenSegmentos] = useState(false);
  const [status, setStatus] = useState<StatusCliente>("prospecto");
  const [potencial, setPotencial] = useState("");
  const [site, setSite] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [responsavelCodigo, setResponsavelCodigo] = useState("");
  const [volume12Meses, setVolume12Meses] = useState("");
  const [isClienteFs, setIsClienteFs] = useState(false);
  const [terminaisOperados, setTerminaisOperados] = useState<string[]>([]);
  const [isFreightForwarder, setIsFreightForwarder] = useState(false);
  const [tiposServico, setTiposServico] = useState<string[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  
  // Contato principal
  const [contatoNome, setContatoNome] = useState("");
  const [contatoEmail, setContatoEmail] = useState("");
  const [contatoTelefone, setContatoTelefone] = useState("");
  const [uploading, setUploading] = useState(false);

  const createCliente = useCreateCliente();
  const { toast } = useToast();
  const { user } = useAuth();

  const addProposta = () => {
    setPropostas([
      ...propostas,
      {
        id: crypto.randomUUID(),
        numero_proposta: "",
        servico: "",
        data_proposta: "",
        vencimento_proposta: "",
        file: null,
      },
    ]);
  };

  const removeProposta = (id: string) => {
    setPropostas(propostas.filter((p) => p.id !== id));
  };

  const updateProposta = (id: string, field: keyof Proposta, value: string | File | null) => {
    setPropostas(
      propostas.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Garante que o usuário está autenticado para passar nas políticas de segurança (RLS)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }

      // Create the client first
      const clienteData = await createCliente.mutateAsync({
        empresa,
        cnpj: cnpj || null,
        segmento: "outros",
        segmentos,
        status,
        potencial: potencial || undefined,
        site: site || undefined,
        observacoes: observacoes || undefined,
        responsavel_codigo: responsavelCodigo || undefined,
        volume_12_meses: volume12Meses ? parseFloat(volume12Meses) : 0,
        is_cliente_fs: isClienteFs,
        terminais_operados: terminaisOperados,
        is_freight_forwarder: isFreightForwarder,
        tipos_servico: tiposServico,
      });

      // Create contato if provided
      if (contatoNome && clienteData?.id) {
        const { error: contatoError } = await supabase
          .from('contatos_cliente')
          .insert({
            cliente_id: clienteData.id,
            nome: contatoNome,
            email: contatoEmail || null,
            telefone: contatoTelefone || null,
            is_principal: true,
          });

        if (contatoError) throw contatoError;
      }

      // Now create propostas if any
      if (propostas.length > 0 && clienteData?.id) {
        for (const proposta of propostas) {
          if (!proposta.numero_proposta || !proposta.servico) continue;

          let propostaUrl = undefined;

          // Upload PDF if provided
          if (proposta.file) {
            const fileExt = proposta.file.name.split('.').pop();
            const fileName = `${clienteData.id}-${proposta.servico}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('propostas')
              .upload(fileName, proposta.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('propostas')
              .getPublicUrl(fileName);

            propostaUrl = publicUrl;
          }

          // Insert proposta
          const { error: propostaError } = await supabase
            .from('propostas_cliente')
            .insert({
              cliente_id: clienteData.id,
              numero_proposta: proposta.numero_proposta,
              servico: proposta.servico,
              data_proposta: proposta.data_proposta || null,
              vencimento_proposta: proposta.vencimento_proposta || null,
              proposta_url: propostaUrl,
              created_by: currentUser.id,
            });

          if (propostaError) throw propostaError;
        }
      }

      // Reset form
      setEmpresa("");
      setCnpj("");
      setSegmentos([]);
      setStatus("prospecto");
      setPotencial("");
      setSite("");
      setObservacoes("");
      setResponsavelCodigo("");
      setVolume12Meses("");
      setIsClienteFs(false);
      setTerminaisOperados([]);
      setIsFreightForwarder(false);
      setTiposServico([]);
      setPropostas([]);
      setContatoNome("");
      setContatoEmail("");
      setContatoTelefone("");

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="empresa">Empresa *</Label>
        <Input
          id="empresa"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      {/* Contato Principal */}
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <h4 className="font-medium text-sm">Contato Principal</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="contatoNome">Nome</Label>
            <Input
              id="contatoNome"
              value={contatoNome}
              onChange={(e) => setContatoNome(e.target.value)}
              placeholder="Nome do contato"
            />
          </div>
          <div>
            <Label htmlFor="contatoEmail">Email</Label>
            <Input
              id="contatoEmail"
              type="email"
              value={contatoEmail}
              onChange={(e) => setContatoEmail(e.target.value)}
              placeholder="email@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="contatoTelefone">Telefone</Label>
            <Input
              id="contatoTelefone"
              value={contatoTelefone}
              onChange={(e) => setContatoTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Segmentos (multi-seleção)</Label>
        <Popover open={openSegmentos} onOpenChange={setOpenSegmentos}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {segmentos.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {segmentos.map((seg) => (
                    <Badge key={seg} variant="secondary" className="mr-1">
                      {seg}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSegmentos(segmentos.filter((s) => s !== seg));
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Selecione os segmentos</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar segmento..."
                value={segmentoSearch}
                onValueChange={setSegmentoSearch}
              />
              <CommandEmpty>Nenhum segmento encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {SEGMENTOS.filter((seg) =>
                  seg.toLowerCase().includes(segmentoSearch.toLowerCase())
                ).map((seg) => (
                  <CommandItem
                    key={seg}
                    onSelect={() => {
                      if (segmentos.includes(seg)) {
                        setSegmentos(segmentos.filter((s) => s !== seg));
                      } else {
                        setSegmentos([...segmentos, seg]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={segmentos.includes(seg)}
                        onChange={() => {}}
                        className="rounded border-gray-300"
                      />
                      <span>{seg}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as StatusCliente)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="potencial">Potencial</Label>
        <Input
          id="potencial"
          value={potencial}
          onChange={(e) => setPotencial(e.target.value)}
          placeholder="Ex: Alto, Médio, Baixo"
        />
      </div>

      <div>
        <Label htmlFor="site">Site</Label>
        <Input
          id="site"
          type="url"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Terminais onde opera</Label>
        <div className="grid grid-cols-2 gap-2">
          {["EMPÓRIO", "TPC", "INTER", "TECON"].map((terminal) => (
            <label key={terminal} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={terminaisOperados.includes(terminal)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTerminaisOperados([...terminaisOperados, terminal]);
                  } else {
                    setTerminaisOperados(terminaisOperados.filter(t => t !== terminal));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span>{terminal}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isFreightForwarder"
          checked={isFreightForwarder}
          onChange={(e) => setIsFreightForwarder(e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isFreightForwarder">É Freight Forwarder?</Label>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Serviço</Label>
        <div className="grid grid-cols-2 gap-2">
          {["Importação", "Exportação", "Logística Integrada", "Transporte", "Armazém / AG", "Carga Projeto", "Carga Solta", "CNTR"].map((servico) => (
            <label key={servico} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={tiposServico.includes(servico)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTiposServico([...tiposServico, servico]);
                  } else {
                    setTiposServico(tiposServico.filter(s => s !== servico));
                  }
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{servico}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsavel">Código do Responsável</Label>
          <Input
            id="responsavel"
            value={responsavelCodigo}
            onChange={(e) => {
              const valor = e.target.value.toUpperCase();
              setResponsavelCodigo(valor);
              setIsClienteFs(valor === "FS");
            }}
            placeholder="Ex: FS, JN, etc"
          />
        </div>

        <div>
          <Label htmlFor="volume">Volume 12 Meses</Label>
          <Input
            id="volume"
            type="number"
            step="0.01"
            value={volume12Meses}
            onChange={(e) => setVolume12Meses(e.target.value)}
            placeholder="Volume total em 12 meses"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="clienteFs"
          checked={isClienteFs}
          onChange={(e) => setIsClienteFs(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="clienteFs" className="cursor-pointer">
          Cliente FS (automaticamente marcado se responsável = FS)
        </Label>
      </div>

      {/* Propostas Section */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Propostas</h3>
          <Button type="button" variant="outline" size="sm" onClick={addProposta} className="gap-1">
            <Plus className="h-4 w-4" />
            Adicionar Proposta
          </Button>
        </div>

        {propostas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma proposta adicionada. Clique no botão acima para adicionar.
          </p>
        ) : (
          <div className="space-y-4">
            {propostas.map((proposta, index) => (
              <Card key={proposta.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Proposta {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProposta(proposta.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Serviço *</Label>
                      <Select
                        value={proposta.servico}
                        onValueChange={(value) => updateProposta(proposta.id, "servico", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICOS_PROPOSTA.map((servico) => (
                            <SelectItem key={servico} value={servico}>
                              {servico}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Número da Proposta *</Label>
                      <Input
                        value={proposta.numero_proposta}
                        onChange={(e) => updateProposta(proposta.id, "numero_proposta", e.target.value)}
                        placeholder="Ex: PROP-2024-001"
                      />
                    </div>

                    <div>
                      <Label>Data da Proposta</Label>
                      <Input
                        type="date"
                        value={proposta.data_proposta}
                        onChange={(e) => updateProposta(proposta.id, "data_proposta", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Vencimento</Label>
                      <Input
                        type="date"
                        value={proposta.vencimento_proposta}
                        onChange={(e) => updateProposta(proposta.id, "vencimento_proposta", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Anexar PDF</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => updateProposta(proposta.id, "file", e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      {proposta.file && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{proposta.file.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={createCliente.isPending || uploading}>
        {uploading ? "Enviando..." : createCliente.isPending ? "Criando..." : "Criar Cliente"}
      </Button>
    </form>
  );
}
