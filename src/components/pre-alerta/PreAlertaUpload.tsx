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
  eta: ["previsao", "previsão", "prev", "eta", "chegada", "arrival", "data_chegada", "data chegada", "dt chegada", "dt_chegada", "data eta", "prev chegada", "data prev", "dt prev"],
  armador: ["armador", "carrier", "linha", "shipowner", "shipping_line", "cia maritima", "companhia", "linha maritima", "shipping"],
  cliente_nome: ["cliente", "consignee", "consignatário", "consignatario", "importador", "customer", "nome_cliente", "nome cliente", "razao social", "razão social", "empresa", "destinatario", "destinatário", "nome", "recebedor", "consig", "clie"],
  cliente_cnpj: ["cnpj", "cnpj_cliente", "tax_id", "cnpj cliente", "documento", "cpf_cnpj", "cpf/cnpj"],
  cntr_numero: ["container", "cntr", "numero_container", "container_number", "num container", "n container", "conteiner", "contêiner", "num_cntr", "numero cntr", "numero container"],
  qtd_20: ["20", "20'", "20ft", "cntr 20", "20 pes", "20 pés", "qtd 20", "qtd20"],
  qtd_40: ["40", "40'", "40ft", "cntr 40", "40 pes", "40 pés", "qtd 40", "qtd40"],
  tipo_carga: ["carga", "cargo", "mercadoria", "commodity", "produto", "descricao", "descrição", "desc carga", "tipo carga", "natureza"],
  peso_bruto: ["peso", "weight", "peso_bruto", "gross_weight", "peso bruto", "kg", "peso kg", "tonelada", "ton"],
};

function normalizeText(text: string): string {
  return text?.toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, "") // Remove todos caracteres especiais
    .trim();
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const headerRaw = headers[i]?.toString() || "";
    const normalizedHeader = normalizeText(headerRaw);
    
    // Skip empty headers
    if (!normalizedHeader) continue;
    
    for (const name of possibleNames) {
      const normalizedName = normalizeText(name);
      
      // Skip empty names
      if (!normalizedName) continue;
      
      // Exact match
      if (normalizedHeader === normalizedName) return i;
      
      // Header starts with name (e.g., "previsao" matches "previsao:")
      if (normalizedHeader.startsWith(normalizedName)) return i;
      
      // Header contains name
      if (normalizedHeader.includes(normalizedName)) return i;
      
      // Name contains header (for short headers)
      if (normalizedName.includes(normalizedHeader) && normalizedHeader.length >= 3) return i;
    }
  }
  return -1;
}

function parseExcelDate(value: any): string | null {
  if (!value) return null;
  
  // If it's an Excel serial date number
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2100) {
      return date.toISOString().split("T")[0];
    }
  }
  
  // If it's a Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }
  
  // If it's a string
  if (typeof value === "string") {
    const trimmed = value.trim();
    
    // Try DD/MM/YYYY or DD/MM/YY format first (most common in Brazil)
    const brMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (brMatch) {
      let [, day, month, year] = brMatch;
      let yearNum = parseInt(year);
      // Handle 2-digit years
      if (yearNum < 100) {
        yearNum = yearNum + 2000;
      }
      const date = new Date(yearNum, parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2100) {
        return date.toISOString().split("T")[0];
      }
    }
    
    // Try YYYY-MM-DD format
    const isoMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    
    // Try parsing as standard date string
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2020 && parsed.getFullYear() <= 2100) {
      return parsed.toISOString().split("T")[0];
    }
  }
  
  return null;
}

// Try to find a date value in any cell of the row (fallback for ETA detection)
function findDateInRow(row: any[], startIndex: number, endIndex: number): string | null {
  for (let i = startIndex; i <= endIndex && i < row.length; i++) {
    const dateValue = parseExcelDate(row[i]);
    if (dateValue) {
      return dateValue;
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

      // Map data to PreAlertaItem format - create separate rows for 20' and 40' containers
      const mappedItems: Partial<PreAlertaItem>[] = [];
      
      rows.forEach(row => {
        const clienteNome = row[columnIndices.cliente_nome]?.toString().trim() || "";
        const clienteCnpj = columnIndices.cliente_cnpj !== -1 
          ? row[columnIndices.cliente_cnpj]?.toString().trim() 
          : null;

        // Try to match with existing client
        const matchedClient = clientes?.find(c => 
          c.empresa.toLowerCase() === clienteNome.toLowerCase() ||
          (clienteCnpj && c.cnpj === clienteCnpj)
        );

        // Try to get ETA from mapped column, or search in first 10 columns if not found
        let etaValue: string | null = null;
        if (columnIndices.eta !== -1) {
          etaValue = parseExcelDate(row[columnIndices.eta]);
        }
        // Fallback: search for a date value in the first 10 columns if ETA column not found or empty
        if (!etaValue) {
          etaValue = findDateInRow(row, 0, Math.min(9, row.length - 1));
        }

        const baseItem = {
          navio: row[columnIndices.navio]?.toString().trim() || "N/A",
          nv: columnIndices.nv !== -1 ? row[columnIndices.nv]?.toString().trim() : null,
          eta: etaValue,
          armador: columnIndices.armador !== -1 ? row[columnIndices.armador]?.toString().trim() : null,
          cliente_nome: clienteNome,
          cliente_cnpj: clienteCnpj,
          cntr_numero: columnIndices.cntr_numero !== -1 ? row[columnIndices.cntr_numero]?.toString().trim() : null,
          tipo_carga: columnIndices.tipo_carga !== -1 ? row[columnIndices.tipo_carga]?.toString().trim() : null,
          peso_bruto: columnIndices.peso_bruto !== -1 ? parseFloat(row[columnIndices.peso_bruto]) || null : null,
          cliente_id: matchedClient?.id || null,
          is_cliente_intermaritima: !!matchedClient,
          status_comercial: "pendente",
        };

        // Get quantities from columns H (20') and I (40') - indices 7 and 8
        const qtd20 = columnIndices.qtd_20 !== -1 ? parseInt(row[columnIndices.qtd_20]) || 0 : parseInt(row[7]) || 0;
        const qtd40 = columnIndices.qtd_40 !== -1 ? parseInt(row[columnIndices.qtd_40]) || 0 : parseInt(row[8]) || 0;

        // Create row for 20' containers if quantity > 0
        if (qtd20 > 0) {
          mappedItems.push({
            ...baseItem,
            tipo_container: "20'",
            quantidade: qtd20,
          });
        }

        // Create row for 40' containers if quantity > 0
        if (qtd40 > 0) {
          mappedItems.push({
            ...baseItem,
            tipo_container: "40'",
            quantidade: qtd40,
          });
        }

        // If no container quantities, create a single row with quantity 1
        if (qtd20 === 0 && qtd40 === 0) {
          mappedItems.push({
            ...baseItem,
            tipo_container: null,
            quantidade: 1,
          });
        }
      });
      
      const filteredItems = mappedItems.filter(item => item.cliente_nome && item.navio);

      setMappedData(filteredItems);
      toast.success(`${filteredItems.length} registros processados`);
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
