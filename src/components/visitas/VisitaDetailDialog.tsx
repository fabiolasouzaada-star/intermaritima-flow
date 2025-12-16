import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisitaEditForm } from "@/components/forms/VisitaEditForm";
import type { Visita } from "@/hooks/useVisitas";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";

interface VisitaDetailDialogProps {
  visita: Visita | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitaDetailDialog({ visita, open, onOpenChange }: VisitaDetailDialogProps) {
  if (!visita) return null;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Visita", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Client name
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(visita.clientes?.empresa || "Não informado", 50, y);
    y += 10;

    // Date
    doc.setFont("helvetica", "bold");
    doc.text("Data:", 20, y);
    doc.setFont("helvetica", "normal");
    const dataFormatada = new Date(visita.data_visita).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(dataFormatada, 50, y);
    y += 10;

    // Status
    const statusLabels: Record<string, string> = {
      a_agendar: "A Agendar",
      agendada: "Agendada",
      realizada: "Realizada",
      cancelada: "Cancelada",
    };
    doc.setFont("helvetica", "bold");
    doc.text("Status:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(statusLabels[visita.status] || visita.status, 50, y);
    y += 15;

    // Helper function to add section
    const addSection = (title: string, content: string | null) => {
      if (!content) return;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, y);
      y += 7;
      
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, pageWidth - 40);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 8;

      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // Add sections
    addSection("Objetivo", visita.objetivo);
    addSection("Situação Atual", visita.situacao_atual);
    addSection("Oportunidades Identificadas", visita.oportunidades_identificadas);
    addSection("Dores Percebidas", visita.dores_percebidas);
    addSection("Próximos Passos", visita.proximos_passos);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      pageWidth / 2,
      290,
      { align: "center" }
    );

    // Save
    const fileName = `visita-${visita.clientes?.empresa?.replace(/\s+/g, "-") || "cliente"}-${new Date(visita.data_visita).toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Editar Visita</DialogTitle>
          {visita.status === "realizada" && (
            <Button
              variant="outline"
              size="sm"
              onClick={generatePDF}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Gerar PDF
            </Button>
          )}
        </DialogHeader>
        <VisitaEditForm visita={visita} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
