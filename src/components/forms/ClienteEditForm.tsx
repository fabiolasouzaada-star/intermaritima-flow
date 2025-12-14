import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateCliente, type Cliente } from "@/hooks/useClientes";
import type { Database } from "@/integrations/supabase/types";
import { SEGMENTOS } from "@/constants/segmentos";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";

type StatusCliente = Database["public"]["Enums"]["status_cliente"];

interface ClienteEditFormProps {
  cliente: Cliente;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClienteEditForm({ cliente, onSuccess, onCancel }: ClienteEditFormProps) {
  const [empresa, setEmpresa] = useState(cliente.empresa || "");
  const [cnpj, setCnpj] = useState(cliente.cnpj || "");
  const [segmentos, setSegmentos] = useState<string[]>(cliente.segmentos || []);
  const [segmentoSearch, setSegmentoSearch] = useState("");
  const [openSegmentos, setOpenSegmentos] = useState(false);
  const [status, setStatus] = useState<StatusCliente>(cliente.status || "prospecto");
  const [potencial, setPotencial] = useState(cliente.potencial || "");
  const [site, setSite] = useState(cliente.site || "");
  const [observacoes, setObservacoes] = useState(cliente.observacoes || "");
  const [responsavelCodigo, setResponsavelCodigo] = useState(cliente.responsavel_codigo || "");
  const [volume12Meses, setVolume12Meses] = useState(cliente.volume_12_meses?.toString() || "");
  const [isClienteFs, setIsClienteFs] = useState(cliente.is_cliente_fs || false);
  const [terminaisOperados, setTerminaisOperados] = useState<string[]>(cliente.terminais_operados || []);
  const [isFreightForwarder, setIsFreightForwarder] = useState(cliente.is_freight_forwarder || false);
  const [tiposServico, setTiposServico] = useState<string[]>(cliente.tipos_servico || []);
  
  // Campos de Proposta
  const [numeroProposta, setNumeroProposta] = useState(cliente.numero_proposta || "");
  const [dataProposta, setDataProposta] = useState(cliente.data_proposta || "");
  const [vencimentoProposta, setVencimentoProposta] = useState(cliente.vencimento_proposta || "");
  const [propostaUrl, setPropostaUrl] = useState(cliente.proposta_url || "");

  const updateCliente = useUpdateCliente();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateCliente.mutateAsync({
      id: cliente.id,
      data: {
        empresa,
        cnpj: cnpj || null,
        segmentos,
        status,
        potencial: potencial || null,
        site: site || null,
        observacoes: observacoes || null,
        responsavel_codigo: responsavelCodigo || null,
        volume_12_meses: volume12Meses ? parseFloat(volume12Meses) : 0,
        is_cliente_fs: isClienteFs,
        terminais_operados: terminaisOperados,
        is_freight_forwarder: isFreightForwarder,
        tipos_servico: tiposServico,
        numero_proposta: numeroProposta || null,
        data_proposta: dataProposta || null,
        vencimento_proposta: vencimentoProposta || null,
        proposta_url: propostaUrl || null,
      },
    });

    onSuccess?.();
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
              className="w-full justify-start text-left font-normal min-h-[40px] h-auto"
              type="button"
            >
              {segmentos.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {segmentos.map((seg) => (
                    <Badge key={seg} variant="secondary" className="mr-1">
                      {seg}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
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
          <PopoverContent className="w-[300px] p-0 z-50 bg-popover" align="start">
            <div className="p-2 border-b">
              <Input
                placeholder="Buscar segmento..."
                value={segmentoSearch}
                onChange={(e) => setSegmentoSearch(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {SEGMENTOS
                .filter((seg) =>
                  seg.toLowerCase().includes(segmentoSearch.toLowerCase())
                )
                .slice(0, 50)
                .map((seg) => (
                  <div
                    key={seg}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={() => {
                      if (segmentos.includes(seg)) {
                        setSegmentos(segmentos.filter((s) => s !== seg));
                      } else {
                        setSegmentos([...segmentos, seg]);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={segmentos.includes(seg)}
                      onChange={() => {}}
                      className="rounded border-input pointer-events-none"
                    />
                    <span className="text-sm">{seg}</span>
                  </div>
                ))}
              {SEGMENTOS.filter((seg) =>
                seg.toLowerCase().includes(segmentoSearch.toLowerCase())
              ).length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Digite para filtrar mais resultados...
                </p>
              )}
            </div>
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

      {/* Seção de Proposta */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">Dados da Proposta</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numeroProposta">Número da Proposta</Label>
            <Input
              id="numeroProposta"
              value={numeroProposta}
              onChange={(e) => setNumeroProposta(e.target.value)}
              placeholder="Ex: PROP-2024-001"
            />
          </div>

          <div>
            <Label htmlFor="propostaUrl">URL da Proposta (PDF)</Label>
            <Input
              id="propostaUrl"
              type="url"
              value={propostaUrl}
              onChange={(e) => setPropostaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="dataProposta">Data da Proposta</Label>
            <Input
              id="dataProposta"
              type="date"
              value={dataProposta}
              onChange={(e) => setDataProposta(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="vencimentoProposta">Vencimento da Proposta</Label>
            <Input
              id="vencimentoProposta"
              type="date"
              value={vencimentoProposta}
              onChange={(e) => setVencimentoProposta(e.target.value)}
            />
          </div>
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

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={updateCliente.isPending}>
          {updateCliente.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
