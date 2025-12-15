import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisitaEditForm } from "@/components/forms/VisitaEditForm";
import type { Visita } from "@/hooks/useVisitas";

interface VisitaDetailDialogProps {
  visita: Visita | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitaDetailDialog({ visita, open, onOpenChange }: VisitaDetailDialogProps) {
  if (!visita) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Visita</DialogTitle>
        </DialogHeader>
        <VisitaEditForm visita={visita} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
