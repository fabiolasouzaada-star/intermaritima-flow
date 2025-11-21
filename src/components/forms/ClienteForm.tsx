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
import { Upload, X } from "lucide-react";
import { SEGMENTOS } from "@/constants/segmentos";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type StatusCliente = Database["public"]["Enums"]["status_cliente"];

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
  const [numeroProposta, setNumeroProposta] = useState("");
  const [dataProposta, setDataProposta] = useState("");
  const [vencimentoProposta, setVencimentoProposta] = useState("");
  const [propostaFile, setPropostaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responsavelCodigo, setResponsavelCodigo] = useState("");
  const [volume12Meses, setVolume12Meses] = useState("");
  const [isClienteFs, setIsClienteFs] = useState(false);
  const [terminaisOperados, setTerminaisOperados] = useState<string[]>([]);
  const [isFreightForwarder, setIsFreightForwarder] = useState(false);
  const [tiposServico, setTiposServico] = useState<string[]>([]);

  const createCliente = useCreateCliente();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let propostaUrl = undefined;

      // Upload PDF if provided
      if (propostaFile) {
        const fileExt = propostaFile.name.split('.').pop();
        const fileName = `${cnpj}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('propostas')
          .upload(filePath, propostaFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('propostas')
          .getPublicUrl(filePath);

        propostaUrl = publicUrl;
      }

      await createCliente.mutateAsync({
        empresa,
        cnpj: cnpj || null,
        segmento: "outros",
        segmentos,
        status,
        potencial: potencial || undefined,
        site: site || undefined,
        observacoes: observacoes || undefined,
        numero_proposta: status === "ativo" && numeroProposta ? numeroProposta : undefined,
        data_proposta: status === "ativo" && dataProposta ? dataProposta : undefined,
        vencimento_proposta: status === "ativo" && vencimentoProposta ? vencimentoProposta : undefined,
        proposta_url: status === "ativo" ? propostaUrl : undefined,
        responsavel_codigo: responsavelCodigo || undefined,
        volume_12_meses: volume12Meses ? parseFloat(volume12Meses) : 0,
        is_cliente_fs: isClienteFs,
        terminais_operados: terminaisOperados,
        is_freight_forwarder: isFreightForwarder,
        tipos_servico: tiposServico,
      });

      // Reset form
      setEmpresa("");
      setCnpj("");
      setSegmentos([]);
      setStatus("prospecto");
      setPotencial("");
      setSite("");
      setObservacoes("");
      setNumeroProposta("");
      setDataProposta("");
      setVencimentoProposta("");
      setPropostaFile(null);
      setResponsavelCodigo("");
      setVolume12Meses("");
      setIsClienteFs(false);
      setTerminaisOperados([]);
      setIsFreightForwarder(false);
      setTiposServico([]);

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

      {status === "ativo" && (
        <>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Dados da Proposta</h3>
          </div>

          <div>
            <Label htmlFor="numeroProposta">Número da Proposta *</Label>
            <Input
              id="numeroProposta"
              value={numeroProposta}
              onChange={(e) => setNumeroProposta(e.target.value)}
              required
              placeholder="Ex: PROP-2024-001"
            />
          </div>

          <div>
            <Label htmlFor="dataProposta">Data da Proposta *</Label>
            <Input
              id="dataProposta"
              type="date"
              value={dataProposta}
              onChange={(e) => setDataProposta(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="vencimentoProposta">Vencimento da Proposta *</Label>
            <Input
              id="vencimentoProposta"
              type="date"
              value={vencimentoProposta}
              onChange={(e) => setVencimentoProposta(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="propostaFile">Anexar PDF da Proposta</Label>
            <div className="flex items-center gap-2">
              <Input
                id="propostaFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setPropostaFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {propostaFile && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {propostaFile.name}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={createCliente.isPending || uploading}>
        {uploading ? "Enviando..." : createCliente.isPending ? "Criando..." : "Criar Cliente"}
      </Button>
    </form>
  );
}