import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Check } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function ImportarClientes() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: number;
    errors: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportSummary(null);
    }
  };

  const processExcel = async () => {
    if (!file) {
      toast.error("Selecione um arquivo Excel");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let success = 0;
      let errors = 0;

      for (const row of jsonData as any[]) {
        try {
          // Mapeamento básico - ajuste conforme as colunas do seu Excel
          const clienteData = {
            empresa: row["Cliente"] || row["CLIENTE"] || row["Nome"] || "",
            cnpj: row["CNPJ"] || "",
            responsavel_codigo: row["Responsavel"] || row["RESPONSAVEL"] || row["Rep."] || "",
            segmento: (row["Segmento"] || row["SEGMENTO"] || "outros").toLowerCase(),
            status: (row["Status"] || row["STATUS"] || "prospecto").toLowerCase(),
            volume_12_meses: parseFloat(row["Volume"] || row["VOLUME"] || row["Volume 12M"] || 0),
            is_cliente_fs: (row["Responsavel"] || row["RESPONSAVEL"] || "").toUpperCase() === "FS",
            observacoes: row["Observações"] || row["OBSERVACOES"] || null,
            terminais_operados: (row["Terminais"] || row["TERMINAIS"] || "")
              .toString()
              .split(",")
              .map((t: string) => t.trim())
              .filter((t: string) => t.length > 0) || [],
            is_freight_forwarder: (row["Freight Forwarder"] || row["FF"] || "").toString().toUpperCase() === "SIM",
            tipos_servico: (row["Tipo de Serviço"] || row["Servicos"] || row["SERVICOS"] || "")
              .toString()
              .split(",")
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0) || [],
          };

          // Valida campos obrigatórios
          if (!clienteData.empresa) {
            errors++;
            continue;
          }

          const { error } = await supabase.from("clientes").insert(clienteData);

          if (error) {
            errors++;
          } else {
            success++;
          }
        } catch (err) {
          errors++;
        }
      }

      setImportSummary({
        total: jsonData.length,
        success,
        errors,
      });

      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(`Importação concluída! ${success} clientes importados.`);
    } catch (error) {
      toast.error("Erro ao processar arquivo Excel");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar Clientes</h1>
        <p className="text-muted-foreground">
          Importe sua carteira de clientes a partir de uma planilha Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Planilha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="excel-file">Arquivo Excel (.xlsx, .xls)</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Estrutura esperada do Excel:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Cliente ou Nome: Nome da empresa</li>
              <li>CNPJ: CNPJ do cliente (opcional)</li>
              <li>Responsavel ou Rep.: Código do responsável (ex: FS, JN)</li>
              <li>Segmento: industrial, comercial, varejo, tecnologia, outros</li>
              <li>Status: ativo, inativo, prospecto</li>
              <li>Volume ou Volume 12M: Volume em 12 meses (numérico)</li>
              <li>Terminais: Lista separada por vírgula (ex: INTER,TPC)</li>
              <li>Freight Forwarder ou FF: SIM ou NÃO</li>
              <li>Tipo de Serviço ou Servicos: Lista separada por vírgula</li>
              <li>Observações: Campo texto livre (opcional)</li>
            </ul>
          </div>

          <Button
            onClick={processExcel}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>Processando...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar Clientes
              </>
            )}
          </Button>

          {importSummary && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-green-900">Importação Concluída</h4>
                    <p className="text-sm text-green-700">
                      Total de linhas: {importSummary.total}
                    </p>
                    <p className="text-sm text-green-700">
                      Importados com sucesso: {importSummary.success}
                    </p>
                    {importSummary.errors > 0 && (
                      <p className="text-sm text-orange-700">
                        Erros: {importSummary.errors}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dicas de Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • A primeira linha do Excel deve conter os cabeçalhos das colunas
          </p>
          <p>
            • Clientes com responsável = FS serão automaticamente marcados como "Cliente FS"
          </p>
          <p>
            • Certifique-se de que os valores de Segmento e Status estão corretos
          </p>
          <p>
            • O campo Volume deve ser numérico (sem formatação de moeda)
          </p>
          <p>
            • Clientes duplicados serão ignorados se já existirem no sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
