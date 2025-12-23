import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Proposta, ServicoItem, useUpdateProposta, usePropostaHistorico } from "@/hooks/usePropostas";
import { Download, Send, CheckCircle, XCircle, FileText, History, Edit } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface PropostaViewerProps {
  proposta: Proposta;
  onClose?: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-500" },
  enviada: { label: "Enviada", color: "bg-blue-500" },
  aprovada: { label: "Aprovada", color: "bg-green-500" },
  rejeitada: { label: "Rejeitada", color: "bg-red-500" },
};

export function PropostaViewer({ proposta, onClose }: PropostaViewerProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const updateProposta = useUpdateProposta();
  const { data: historico } = usePropostaHistorico(proposta.id);

  const servicos = (proposta.servicos || []) as unknown as ServicoItem[];
  const status = statusConfig[proposta.status];

  const handleStatusChange = async (newStatus: "enviada" | "aprovada" | "rejeitada") => {
    const updates: Record<string, any> = { status: newStatus };
    
    if (newStatus === "enviada") updates.enviada_em = new Date().toISOString();
    if (newStatus === "aprovada") updates.aprovada_em = new Date().toISOString();
    if (newStatus === "rejeitada") updates.rejeitada_em = new Date().toISOString();

    await updateProposta.mutateAsync({
      id: proposta.id,
      data: updates,
      criarHistorico: true,
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // === CABEÇALHO INSTITUCIONAL ===
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const headerLines = doc.splitTextToSize(proposta.cabecalho_institucional, pageWidth - margin * 2);
      headerLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, y, { align: "center" });
        y += 5;
      });
      y += 10;

      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // === NÚMERO DA PROPOSTA E DATA ===
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`PROPOSTA COMERCIAL`, pageWidth / 2, y, { align: "center" });
      y += 7;
      doc.setFontSize(12);
      doc.text(`Nº ${proposta.numero_proposta}`, pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Data: ${new Date(proposta.created_at).toLocaleDateString("pt-BR", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })}`, pageWidth / 2, y, { align: "center" });
      
      if (proposta.prazo_validade) {
        y += 5;
        doc.text(`Válida até: ${new Date(proposta.prazo_validade).toLocaleDateString("pt-BR")}`, pageWidth / 2, y, { align: "center" });
      }
      y += 15;

      // === DADOS DO CLIENTE ===
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("À", margin, y);
      y += 6;
      doc.setFontSize(11);
      doc.text(proposta.clientes?.empresa || "Cliente não especificado", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      if (proposta.clientes?.cnpj) {
        doc.text(`CNPJ: ${proposta.clientes.cnpj}`, margin, y);
        y += 5;
      }
      if (proposta.contato_nome) {
        doc.text(`Att.: Sr(a). ${proposta.contato_nome}${proposta.contato_cargo ? ` - ${proposta.contato_cargo}` : ""}`, margin, y);
        y += 5;
      }
      if (proposta.contato_email) {
        doc.text(`E-mail: ${proposta.contato_email}`, margin, y);
        y += 5;
      }
      if (proposta.contato_telefone) {
        doc.text(`Tel.: ${proposta.contato_telefone}`, margin, y);
        y += 5;
      }
      y += 10;

      // === REFERÊNCIA ===
      doc.setFont("helvetica", "bold");
      doc.text(`Ref.: ${proposta.modelos_proposta?.nome || "Proposta Comercial"}`, margin, y);
      y += 12;

      // === TEXTO INTRODUTÓRIO ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const introLines = doc.splitTextToSize(proposta.texto_introdutorio, pageWidth - margin * 2);
      introLines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 10;

      // === SERVIÇOS ===
      if (servicos && servicos.length > 0) {
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("TABELA DE SERVIÇOS E VALORES", margin, y);
        y += 10;

        // Cabeçalho da tabela
        doc.setFontSize(9);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, pageWidth - margin * 2, 7, "F");
        doc.text("Serviço", margin + 2, y);
        doc.text("Unidade", pageWidth / 2, y);
        doc.text("Valor", pageWidth - margin - 25, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        servicos.forEach((item) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          const nomeLines = doc.splitTextToSize(item.nome, pageWidth / 2 - margin - 10);
          doc.text(nomeLines, margin + 2, y);
          doc.text(item.unidade, pageWidth / 2, y);
          doc.text(item.valorEditado || item.valor || "A combinar", pageWidth - margin - 25, y);
          y += Math.max(nomeLines.length * 4, 6);
        });
        y += 10;

        // Valor total se houver
        if (proposta.valor_total && proposta.valor_total > 0) {
          doc.setFont("helvetica", "bold");
          doc.text(`Valor Total Estimado: ${new Intl.NumberFormat("pt-BR", { 
            style: "currency", 
            currency: "BRL" 
          }).format(proposta.valor_total)}`, margin, y);
          y += 10;
        }
      }

      // === NOTAS E CONDIÇÕES ===
      if (y > 180) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("NOTAS E CONDIÇÕES GERAIS", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(proposta.notas_condicoes, pageWidth - margin * 2);
      notesLines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 4;
      });
      y += 10;

      // === OBSERVAÇÕES ADICIONAIS ===
      if (proposta.observacoes) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("OBSERVAÇÕES", margin, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const obsLines = doc.splitTextToSize(proposta.observacoes, pageWidth - margin * 2);
        obsLines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 5;
        });
        y += 10;
      }

      // === ASSINATURA ===
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const signLines = doc.splitTextToSize(proposta.assinatura_padrao, pageWidth - margin * 2);
      signLines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 5;
      });

      // Save
      doc.save(`Proposta_${proposta.numero_proposta}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={status.color}>{status.label}</Badge>
          <span className="text-muted-foreground">Versão {proposta.versao}</span>
        </div>
        <div className="flex gap-2">
          {proposta.status === "rascunho" && (
            <Button variant="outline" onClick={() => handleStatusChange("enviada")}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          )}
          {proposta.status === "enviada" && (
            <>
              <Button variant="outline" className="text-green-600" onClick={() => handleStatusChange("aprovada")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button variant="outline" className="text-red-600" onClick={() => handleStatusChange("rejeitada")}>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            </>
          )}
          <Button onClick={generatePDF} disabled={isGeneratingPdf}>
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPdf ? "Gerando..." : "Gerar PDF"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="proposta">
        <TabsList>
          <TabsTrigger value="proposta" className="gap-2">
            <FileText className="h-4 w-4" />
            Proposta
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposta" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="text-center border-b">
              <div className="whitespace-pre-wrap text-sm font-medium">{proposta.cabecalho_institucional}</div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">PROPOSTA COMERCIAL</h2>
                <p className="text-lg font-semibold">Nº {proposta.numero_proposta}</p>
                <p className="text-muted-foreground">
                  Data: {new Date(proposta.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                {proposta.prazo_validade && (
                  <p className="text-sm text-muted-foreground">
                    Válida até: {new Date(proposta.prazo_validade).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">À</p>
                <p className="font-bold text-lg">{proposta.clientes?.empresa}</p>
                {proposta.clientes?.cnpj && <p>CNPJ: {proposta.clientes.cnpj}</p>}
                {proposta.contato_nome && (
                  <p>Att.: Sr(a). {proposta.contato_nome}{proposta.contato_cargo ? ` - ${proposta.contato_cargo}` : ""}</p>
                )}
                {proposta.contato_email && <p>E-mail: {proposta.contato_email}</p>}
                {proposta.contato_telefone && <p>Tel.: {proposta.contato_telefone}</p>}
              </div>

              <div>
                <p className="font-bold">Ref.: {proposta.modelos_proposta?.nome}</p>
              </div>

              <Separator />

              <div className="whitespace-pre-wrap text-sm leading-relaxed">{proposta.texto_introdutorio}</div>

              {servicos && servicos.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">TABELA DE SERVIÇOS E VALORES</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Serviço</th>
                            <th className="text-left p-3 font-medium">Unidade</th>
                            <th className="text-right p-3 font-medium">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {servicos.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-3">{item.nome}</td>
                              <td className="p-3">{item.unidade}</td>
                              <td className="p-3 text-right font-medium">
                                {item.valorEditado || item.valor || "A combinar"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {proposta.valor_total && proposta.valor_total > 0 && (
                <div className="flex justify-between text-lg font-bold p-4 bg-muted rounded-lg">
                  <span>Valor Total Estimado</span>
                  <span>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposta.valor_total)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="font-bold">NOTAS E CONDIÇÕES GERAIS</h3>
                <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {proposta.notas_condicoes}
                </div>
              </div>

              {proposta.observacoes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-bold">OBSERVAÇÕES</h3>
                    <p className="text-sm whitespace-pre-wrap">{proposta.observacoes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="whitespace-pre-wrap text-sm pt-4">{proposta.assinatura_padrao}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              {historico && historico.length > 0 ? (
                <div className="space-y-4">
                  {historico.map((h) => (
                    <div key={h.id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <Edit className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Versão {h.versao}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(h.created_at).toLocaleString("pt-BR")}
                        </p>
                        {h.status_anterior && h.status_novo && h.status_anterior !== h.status_novo && (
                          <p className="text-sm">
                            Status: {h.status_anterior} → {h.status_novo}
                          </p>
                        )}
                        {h.observacao && <p className="text-sm mt-1">{h.observacao}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma alteração registrada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
