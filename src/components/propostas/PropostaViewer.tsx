import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Proposta, ServicoCategoria, useUpdateProposta, usePropostaHistorico } from "@/hooks/usePropostas";
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

  const servicos = proposta.servicos as unknown as ServicoCategoria[];
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

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(proposta.cabecalho_institucional, pageWidth / 2, y, { align: "center" });
      y += 15;

      // Proposal number
      doc.setFontSize(14);
      doc.text(`Proposta Comercial Número ${proposta.numero_proposta}`, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Salvador, ${new Date(proposta.created_at).toLocaleDateString("pt-BR", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })}`, pageWidth / 2, y, { align: "center" });
      y += 15;

      // Client info
      doc.setFontSize(11);
      doc.text("À", margin, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text(proposta.clientes?.empresa || "", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      if (proposta.clientes?.cnpj) {
        doc.text(`CNPJ: ${proposta.clientes.cnpj}`, margin, y);
        y += 6;
      }
      if (proposta.contato_nome) {
        doc.text(`Att.: Sr(a). ${proposta.contato_nome}`, margin, y);
        y += 6;
      }
      y += 10;

      // Reference
      doc.setFont("helvetica", "bold");
      doc.text(`Ref. - ${proposta.modelos_proposta?.nome || "Proposta Comercial"}`, margin, y);
      y += 10;

      // Intro text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const introLines = doc.splitTextToSize(proposta.texto_introdutorio, pageWidth - margin * 2);
      doc.text(introLines, margin, y);
      y += introLines.length * 5 + 10;

      // Services
      if (servicos && servicos.length > 0) {
        doc.addPage();
        y = 20;
        
        servicos.forEach((categoria) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(categoria.categoria, margin, y);
          y += 6;
          doc.setFontSize(10);
          doc.text(categoria.subcategoria, margin, y);
          y += 8;

          doc.setFont("helvetica", "normal");
          categoria.itens.forEach((item) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            const valor = item.valorEditado || item.valor;
            doc.text(`• ${item.nome}: ${valor} (${item.unidade})`, margin + 5, y);
            y += 5;
          });
          y += 8;
        });
      }

      // Notes
      doc.addPage();
      y = 20;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Notas e Condições Gerais", margin, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(proposta.notas_condicoes, pageWidth - margin * 2);
      doc.text(notesLines, margin, y);
      y += notesLines.length * 4 + 15;

      // Signature
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      const signLines = doc.splitTextToSize(proposta.assinatura_padrao, pageWidth - margin * 2);
      doc.text(signLines, margin, y);

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
            <CardHeader>
              <CardTitle className="text-center">{proposta.cabecalho_institucional}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Proposta Comercial Número {proposta.numero_proposta}</h2>
                <p className="text-muted-foreground">
                  Salvador, {new Date(proposta.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">À</p>
                <p className="font-bold text-lg">{proposta.clientes?.empresa}</p>
                {proposta.clientes?.cnpj && <p>CNPJ: {proposta.clientes.cnpj}</p>}
                {proposta.contato_nome && <p>Att.: Sr(a). {proposta.contato_nome}</p>}
              </div>

              <div>
                <p className="font-bold">Ref. - {proposta.modelos_proposta?.nome}</p>
              </div>

              <Separator />

              <div className="whitespace-pre-wrap text-sm">{proposta.texto_introdutorio}</div>

              {servicos && servicos.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    <h3 className="font-bold text-lg">Serviços</h3>
                    {servicos.map((categoria, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold">{categoria.categoria}</h4>
                        <p className="text-sm text-muted-foreground">{categoria.subcategoria}</p>
                        <div className="space-y-1 pl-4">
                          {categoria.itens.map((item, iIdx) => (
                            <div key={iIdx} className="flex justify-between text-sm">
                              <span>{item.nome}</span>
                              <span className="font-medium">
                                {item.valorEditado || item.valor} ({item.unidade})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {proposta.valor_total && proposta.valor_total > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Total Estimado</span>
                    <span>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposta.valor_total)}
                    </span>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="font-bold">Notas e Condições</h3>
                <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {proposta.notas_condicoes}
                </div>
              </div>

              {proposta.observacoes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-bold">Observações</h3>
                    <p className="text-sm">{proposta.observacoes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="whitespace-pre-wrap text-sm">{proposta.assinatura_padrao}</div>
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
