-- Create table for ship pre-alert uploads
CREATE TABLE public.pre_alerta_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  processado BOOLEAN DEFAULT false,
  total_registros INTEGER DEFAULT 0
);

-- Create table for ship pre-alert items (individual records from Excel)
CREATE TABLE public.pre_alerta_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.pre_alerta_uploads(id) ON DELETE CASCADE,
  navio TEXT NOT NULL,
  nv TEXT,
  eta DATE,
  armador TEXT,
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cntr_numero TEXT,
  tipo_container TEXT,
  quantidade INTEGER DEFAULT 1,
  tipo_carga TEXT,
  peso_bruto DECIMAL(12,2),
  cliente_id UUID REFERENCES public.clientes(id),
  is_cliente_intermaritima BOOLEAN DEFAULT false,
  status_comercial TEXT DEFAULT 'pendente',
  comercial_responsavel TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pre_alerta_itens_navio ON public.pre_alerta_itens(navio);
CREATE INDEX idx_pre_alerta_itens_nv ON public.pre_alerta_itens(nv);
CREATE INDEX idx_pre_alerta_itens_eta ON public.pre_alerta_itens(eta);
CREATE INDEX idx_pre_alerta_itens_cliente_nome ON public.pre_alerta_itens(cliente_nome);
CREATE INDEX idx_pre_alerta_itens_armador ON public.pre_alerta_itens(armador);
CREATE INDEX idx_pre_alerta_itens_status ON public.pre_alerta_itens(status_comercial);

-- Enable RLS
ALTER TABLE public.pre_alerta_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_alerta_itens ENABLE ROW LEVEL SECURITY;

-- RLS policies for pre_alerta_uploads
CREATE POLICY "Authenticated users can view uploads"
ON public.pre_alerta_uploads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert uploads"
ON public.pre_alerta_uploads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and managers can delete uploads"
ON public.pre_alerta_uploads FOR DELETE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- RLS policies for pre_alerta_itens
CREATE POLICY "Authenticated users can view items"
ON public.pre_alerta_itens FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert items"
ON public.pre_alerta_itens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update items"
ON public.pre_alerta_itens FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can delete items"
ON public.pre_alerta_itens FOR DELETE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_pre_alerta_itens_updated_at
BEFORE UPDATE ON public.pre_alerta_itens
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();