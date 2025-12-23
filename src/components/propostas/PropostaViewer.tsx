import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Proposta, CategoriaServico, useUpdateProposta, usePropostaHistorico } from "@/hooks/usePropostas";
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

  const categorias = (proposta.servicos || []) as unknown as CategoriaServico[];
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
      let y = 25;

      // === CABEÇALHO INSTITUCIONAL ===
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("INTERMARÍTIMA", pageWidth / 2, y, { align: "center" });
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Portos e Logística S.A.", pageWidth / 2, y, { align: "center" });
      y += 15;

      // Linha decorativa
      doc.setDrawColor(0, 100, 180);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // === TÍTULO DA PROPOSTA ===
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Proposta Comercial Número ${proposta.numero_proposta}`, pageWidth / 2, y, { align: "center" });
      y += 10;

      // Data
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Salvador, ${new Date(proposta.created_at).toLocaleDateString("pt-BR", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })}`, pageWidth / 2, y, { align: "center" });
      y += 15;

      // === DADOS DO CLIENTE ===
      doc.setFontSize(10);
      doc.text("À", margin, y);
      y += 6;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(proposta.clientes?.empresa || "Cliente", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (proposta.contato_nome) {
        doc.text(`ATT.: ${proposta.contato_nome}`, margin, y);
        y += 5;
      }
      if (proposta.contato_email) {
        doc.text(`Email: ${proposta.contato_email}`, margin, y);
        y += 5;
      }
      y += 10;

      // === REFERÊNCIA ===
      doc.setFont("helvetica", "bold");
      doc.text(`Ref. - ${proposta.modelos_proposta?.nome || "Proposta Comercial"}`, margin, y);
      y += 12;

      // === TEXTO INTRODUTÓRIO ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const introLines = doc.splitTextToSize(proposta.texto_introdutorio, pageWidth - margin * 2);
      introLines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 25;
        }
        doc.text(line, margin, y);
        y += 5;
      });
      
      // Assinatura da primeira página
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("Fabíola Souza", margin, y);
      y += 5;
      doc.text("Intermarítima Portos e Logística S.A.", margin, y);

      // === PÁGINAS DE SERVIÇOS ===
      if (categorias && categorias.length > 0) {
        categorias.forEach((categoria) => {
          doc.addPage();
          y = 25;

          // Header da página
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("INTERMARÍTIMA", margin, 15);
          doc.text("CERTIFIED OEA", pageWidth - margin - 30, 15);

          // Título da categoria
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(categoria.categoria, margin, y);
          y += 10;

          // Tabela de serviços
          doc.setFontSize(9);
          
          // Cabeçalho da tabela
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.text("Serviço", margin + 2, y);
          doc.text("Unidade", pageWidth - 70, y);
          doc.text("Valor", pageWidth - margin - 20, y, { align: "right" });
          y += 10;

          doc.setFont("helvetica", "normal");
          categoria.itens.forEach((item) => {
            if (y > 265) {
              doc.addPage();
              y = 25;
              // Header da nova página
              doc.setFontSize(10);
              doc.text("INTERMARÍTIMA", margin, 15);
              doc.setFontSize(9);
            }
            
            // Nome do serviço (pode quebrar linha)
            const nomeLines = doc.splitTextToSize(item.nome, 90);
            doc.text(nomeLines, margin + 2, y);
            
            // Unidade e valor
            doc.text(item.unidade, pageWidth - 70, y);
            doc.text(item.valorEditado || item.valor, pageWidth - margin - 2, y, { align: "right" });
            
            y += Math.max(nomeLines.length * 4, 6) + 2;
            
            // Linha separadora
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(margin, y - 1, pageWidth - margin, y - 1);
          });
        });
      }

      // === NOTAS E CONDIÇÕES ===
      doc.addPage();
      y = 25;
      
      // Header
      doc.setFontSize(10);
      doc.text("INTERMARÍTIMA", margin, 15);
      doc.text("CERTIFIED OEA", pageWidth - margin - 30, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(proposta.notas_condicoes, pageWidth - margin * 2);
      notesLines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 25;
          doc.text("INTERMARÍTIMA", margin, 15);
        }
        doc.text(line, margin, y);
        y += 4.5;
      });

      // === OBSERVAÇÕES ADICIONAIS ===
      if (proposta.observacoes) {
        y += 10;
        if (y > 240) {
          doc.addPage();
          y = 25;
        }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Observações Adicionais:", margin, y);
        y += 7;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const obsLines = doc.splitTextToSize(proposta.observacoes, pageWidth - margin * 2);
        obsLines.forEach((line: string) => {
          if (y > 270) {
            doc.addPage();
            y = 25;
          }
          doc.text(line, margin, y);
          y += 5;
        });
      }

      // === ASSINATURAS ===
      y += 20;
      if (y > 220) {
        doc.addPage();
        y = 100;
      }

      // Assinatura Intermarítima
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Intermarítima Portos e Logística S.A.", margin, y);
      y += 20;
      doc.line(margin, y, margin + 70, y);
      y += 5;
      doc.text("Nome: Fabíola Souza", margin, y);
      y += 5;
      doc.text("Cargo: Gerente Comercial", margin, y);
      y += 5;
      doc.text("E-mail: fabiola.souza@intermaritima.com.br", margin, y);

      // Assinatura Cliente
      const clienteX = pageWidth / 2 + 10;
      y -= 35;
      doc.text("Cliente:", clienteX, y);
      y += 20;
      doc.line(clienteX, y, clienteX + 70, y);
      y += 5;
      doc.text("Nome:", clienteX, y);
      y += 5;
      doc.text("Tel:", clienteX, y);

      // Salvar
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
          {/* Página 1 - Capa */}
          <Card>
            <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="text-2xl text-primary">INTERMARÍTIMA</CardTitle>
              <p className="text-muted-foreground">Portos e Logística S.A.</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center border-b pb-6">
                <h2 className="text-xl font-bold">Proposta Comercial Número {proposta.numero_proposta}</h2>
                <p className="text-muted-foreground">
                  Salvador, {new Date(proposta.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">À</p>
                <p className="font-bold text-xl">{proposta.clientes?.empresa}</p>
                {proposta.contato_nome && <p>ATT.: {proposta.contato_nome}</p>}
                {proposta.contato_email && <p>Email: {proposta.contato_email}</p>}
              </div>

              <div className="pt-4">
                <p className="font-bold text-primary">Ref. - {proposta.modelos_proposta?.nome}</p>
              </div>

              <Separator />

              <div className="whitespace-pre-wrap text-sm leading-relaxed">{proposta.texto_introdutorio}</div>

              <div className="pt-6">
                <p className="font-medium">Fabíola Souza</p>
                <p className="text-muted-foreground">Intermarítima Portos e Logística S.A.</p>
              </div>
            </CardContent>
          </Card>

          {/* Páginas de Serviços */}
          {categorias && categorias.length > 0 && categorias.map((categoria, catIdx) => (
            <Card key={catIdx}>
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
                  <Badge variant="outline">CERTIFIED OEA</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Serviço</th>
                        <th className="text-left p-3 font-medium w-32">Unidade</th>
                        <th className="text-right p-3 font-medium w-32">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoria.itens.map((item, idx) => (
                        <tr key={idx} className="border-t hover:bg-muted/30">
                          <td className="p-3">{item.nome}</td>
                          <td className="p-3 text-muted-foreground">{item.unidade}</td>
                          <td className="p-3 text-right font-medium">{item.valorEditado || item.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Notas e Condições */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas e Condições</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {proposta.notas_condicoes}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {proposta.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{proposta.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Assinaturas */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="font-medium">Intermarítima Portos e Logística S.A.</p>
                  <div className="border-t border-foreground w-48 pt-2">
                    <p className="text-sm">Nome: Fabíola Souza</p>
                    <p className="text-sm">Cargo: Gerente Comercial</p>
                    <p className="text-sm">E-mail: fabiola.souza@intermaritima.com.br</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-medium">Cliente</p>
                  <div className="border-t border-foreground w-48 pt-2">
                    <p className="text-sm">Nome:</p>
                    <p className="text-sm">Tel:</p>
                  </div>
                </div>
              </div>
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
