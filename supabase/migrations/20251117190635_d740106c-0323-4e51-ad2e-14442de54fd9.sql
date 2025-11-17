-- Add proposta fields to clientes table
ALTER TABLE public.clientes
ADD COLUMN numero_proposta TEXT,
ADD COLUMN data_proposta DATE,
ADD COLUMN vencimento_proposta DATE,
ADD COLUMN proposta_url TEXT;

-- Create storage bucket for propostas
INSERT INTO storage.buckets (id, name, public)
VALUES ('propostas', 'propostas', false);

-- Storage policies for propostas
CREATE POLICY "Authenticated users can view propostas"
ON storage.objects FOR SELECT
USING (bucket_id = 'propostas' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload propostas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'propostas' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update propostas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'propostas' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete propostas"
ON storage.objects FOR DELETE
USING (bucket_id = 'propostas' AND auth.role() = 'authenticated');