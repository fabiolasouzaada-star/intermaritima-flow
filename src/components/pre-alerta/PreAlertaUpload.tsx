import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCreatePreAlertaUpload, useCreatePreAlertaItens, PreAlertaItem } from "@/hooks/usePreAlertaNavios";
import { useClientes } from "@/hooks/useClientes";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PreAlertaUploadProps {
  onSuccess?: () => void;
}

// Column mapping - expanded to catch more variations
const COLUMN_MAPPING = {
  navio: ["navio", "vessel", "ship", "embarcacao", "embarcação", "nome_navio", "nome navio", "nomenavio", "nome do navio"],
  nv: ["nv", "viagem", "voyage", "voyage_number", "num_viagem", "numero_viagem", "numero viagem", "n viagem", "n.viagem"],
  eta: ["eta", "chegada", "arrival", "data_chegada", "previsao", "previsão", "data chegada", "dt chegada", "dt_chegada", "data eta", "prev chegada"],
  armador: ["armador", "carrier", "linha", "shipowner", "shipping_line", "cia maritima", "companhia", "linha maritima", "shipping"],
  cliente_nome: ["cliente", "consignee", "consignatário", "consignatario", "importador", "customer", "nome_cliente", "nome cliente", "razao social", "razão social", "empresa", "destinatario", "destinatário", "nome", "recebedor", "consig", "clie"],
  cliente_cnpj: ["cnpj", "cnpj_cliente", "tax_id", "cnpj cliente", "documento", "cpf_cnpj", "cpf/cnpj"],
  cntr_numero: ["container", "cntr", "numero_container", "container_number", "num container", "n container", "conteiner", "contêiner", "num_cntr", "numero cntr", "numero container"],
  tipo_container: ["tipo", "type", "tipo_container", "container_type", "size_type", "tipo container", "tp container", "tp_cntr", "tipo cntr", "size", "tamanho", "tam"],
  quantidade: ["quantidade", "qty", "qtd", "qtde", "count", "quant", "qde", "qt", "qtdd", "unidades", "un", "und"],
  tipo_carga: ["carga", "cargo", "mercadoria", "commodity", "produto", "descricao", "descrição", "desc carga", "tipo carga", "natureza"],
  peso_bruto: ["peso", "weight", "peso_bruto", "gross_weight", "peso bruto", "kg", "peso kg", "tonelada", "ton"],
};

function normalizeText(text: string): string {
  return text?.toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, " ") // Substituir caracteres especiais por espaço
    .replace(/\s+/g, " ") // Múltiplos espaços -> um espaço
    .trim();
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const normalizedHeader = normalizeText(headers[i] || "");
    
    for (const name of possibleNames) {
      const normalizedName = normalizeText(name);
      
      // Verificar match exato
      if (normalizedHeader === normalizedName) return i;
      
      // Verificar se contém
      if (normalizedHeader.includes(normalizedName) || normalizedName.includes(normalizedHeader)) {
        return i;
      }
      
      // Verificar match sem espaços
      const headerNoSpace = normalizedHeader.replace(/\s/g, "");
      const nameNoSpace = normalizedName.replace(/\s/g, "");
      if (headerNoSpace === nameNoSpace || headerNoSpace.includes(nameNoSpace) || nameNoSpace.includes(headerNoSpace)) {
        return i;
      }
    }
  }
  return -1;
}

function parseExcelDate(value: any): string | null {
  if (!value) return null;
  
  // If it's already a date string
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    // Try DD/MM/YYYY format
    const parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    return null;
  }
  
  // If it's an Excel serial date number
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }
  
  return null;
}

export function PreAlertaUpload({ onSuccess }: PreAlertaUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<{ headers: string[]; rows: any[]; fileName: string } | null>(null);
  const [mappedData, setMappedData] = useState<Partial<PreAlertaItem>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createUpload = useCreatePreAlertaUpload();
  const createItens = useCreatePreAlertaItens();
  const { data: clientes } = useClientes();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      if (data.length < 2) {
        toast.error("Planilha vazia ou sem dados");
        return;
      }

      const headers = data[0] as string[];
      const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""));

      setPreview({ headers, rows, fileName: file.name });

      // Map columns and data
      const columnIndices: Record<string, number> = {};
      for (const [field, possibleNames] of Object.entries(COLUMN_MAPPING)) {
        columnIndices[field] = findColumnIndex(headers, possibleNames);
      }

      // Log headers found for debugging
      console.log("Headers encontrados:", headers);
      console.log("Índices mapeados:", columnIndices);

      // Check required columns with better error message
      const missingColumns: string[] = [];
      if (columnIndices.cliente_nome === -1) {
        missingColumns.push("Cliente");
      }
      if (columnIndices.navio === -1) {
        missingColumns.push("Navio");
      }

      if (missingColumns.length > 0) {
        toast.error(`Colunas obrigatórias não encontradas: ${missingColumns.join(", ")}. Headers encontrados: ${headers.filter(h => h).slice(0, 10).join(", ")}`);
        setPreview({ headers, rows: [], fileName: file.name });
        setMappedData([]);
        return;
      }

      // Map data to PreAlertaItem format
      const mappedItems: Partial<PreAlertaItem>[] = rows.map(row => {
        const clienteNome = row[columnIndices.cliente_nome]?.toString().trim() || "";
        const clienteCnpj = columnIndices.cliente_cnpj !== -1 
          ? row[columnIndices.cliente_cnpj]?.toString().trim() 
          : null;

        // Try to match with existing client
        const matchedClient = clientes?.find(c => 
          c.empresa.toLowerCase() === clienteNome.toLowerCase() ||
          (clienteCnpj && c.cnpj === clienteCnpj)
        );

        return {
          navio: row[columnIndices.navio]?.toString().trim() || "N/A",
          nv: columnIndices.nv !== -1 ? row[columnIndices.nv]?.toString().trim() : null,
          eta: columnIndices.eta !== -1 ? parseExcelDate(row[columnIndices.eta]) : null,
          armador: columnIndices.armador !== -1 ? row[columnIndices.armador]?.toString().trim() : null,
          cliente_nome: clienteNome,
          cliente_cnpj: clienteCnpj,
          cntr_numero: columnIndices.cntr_numero !== -1 ? row[columnIndices.cntr_numero]?.toString().trim() : null,
          tipo_container: columnIndices.tipo_container !== -1 ? row[columnIndices.tipo_container]?.toString().trim() : null,
          quantidade: columnIndices.quantidade !== -1 ? parseInt(row[columnIndices.quantidade]) || 1 : 1,
          tipo_carga: columnIndices.tipo_carga !== -1 ? row[columnIndices.tipo_carga]?.toString().trim() : null,
          peso_bruto: columnIndices.peso_bruto !== -1 ? parseFloat(row[columnIndices.peso_bruto]) || null : null,
          cliente_id: matchedClient?.id || null,
          is_cliente_intermaritima: !!matchedClient,
          status_comercial: "pendente",
        };
      }).filter(item => item.cliente_nome && item.navio);

      setMappedData(mappedItems);
      toast.success(`${mappedItems.length} registros processados`);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast.error("Erro ao processar arquivo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (mappedData.length === 0) {
      toast.error("Nenhum dado para importar");
      return;
    }

    setIsProcessing(true);
    try {
      // Create upload record
      const upload = await createUpload.mutateAsync(preview?.fileName || "upload.xlsx");

      // Add upload_id to all items
      const itensComUploadId = mappedData.map(item => ({
        ...item,
        upload_id: upload.id,
      })) as any[];

      await createItens.mutateAsync(itensComUploadId);

      setIsOpen(false);
      setPreview(null);
      setMappedData([]);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao importar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPreview(null);
    setMappedData([]);
  };

  const clientesIntermaritima = mappedData.filter(d => d.is_cliente_intermaritima).length;
  const clientesNovos = mappedData.filter(d => !d.is_cliente_intermaritima).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Pré-Alerta de Navio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Selecione uma planilha Excel com os dados do pré-alerta
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>

              <div className="mt-6 text-left">
                <p className="text-sm font-medium mb-2">Colunas esperadas:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Navio</strong> (obrigatório)</li>
                  <li>• <strong>Cliente</strong> (obrigatório)</li>
                  <li>• NV, ETA, Armador, Container, Tipo, Quantidade, Carga, Peso (opcionais)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Arquivo processado: <strong>{preview.fileName}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{mappedData.length}</div>
                  <div className="text-sm text-muted-foreground">Registros</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{clientesIntermaritima}</div>
                  <div className="text-sm text-muted-foreground">Clientes Intermarítima</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{clientesNovos}</div>
                  <div className="text-sm text-muted-foreground">Novos Clientes</div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Navio</th>
                      <th className="px-3 py-2 text-left">Cliente</th>
                      <th className="px-3 py-2 text-left">ETA</th>
                      <th className="px-3 py-2 text-center">CNTR</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappedData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.navio}</td>
                        <td className="px-3 py-2">{item.cliente_nome}</td>
                        <td className="px-3 py-2">{item.eta || "-"}</td>
                        <td className="px-3 py-2 text-center">{item.quantidade}</td>
                        <td className="px-3 py-2 text-center">
                          {item.is_cliente_intermaritima ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600 inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mappedData.length > 10 && (
                  <div className="px-3 py-2 bg-muted text-center text-sm text-muted-foreground">
                    + {mappedData.length - 10} registros adicionais
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar {mappedData.length} Registros
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
