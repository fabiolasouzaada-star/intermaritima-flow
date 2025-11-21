-- Add new fields to clientes table for FS portfolio management
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS responsavel_codigo TEXT,
ADD COLUMN IF NOT EXISTS volume_12_meses NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cliente_fs BOOLEAN DEFAULT false;

-- Create index for better performance on filtering by responsavel
CREATE INDEX IF NOT EXISTS idx_clientes_responsavel ON public.clientes(responsavel_codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_fs ON public.clientes(is_cliente_fs);

-- Create a table for tracking retomada pipeline stages
CREATE TABLE IF NOT EXISTS public.pipeline_retomada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  estagio TEXT NOT NULL CHECK (estagio IN ('para_contactar', 'em_contato', 'proposta_enviada', 'negociacao', 'retomado')),
  observacoes TEXT,
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pipeline_retomada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pipeline_retomada"
  ON public.pipeline_retomada FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pipeline_retomada"
  ON public.pipeline_retomada FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pipeline_retomada"
  ON public.pipeline_retomada FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete pipeline_retomada"
  ON public.pipeline_retomada FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at on pipeline_retomada
CREATE TRIGGER update_pipeline_retomada_updated_at
  BEFORE UPDATE ON public.pipeline_retomada
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();