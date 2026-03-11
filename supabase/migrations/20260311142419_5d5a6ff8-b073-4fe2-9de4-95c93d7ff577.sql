
CREATE TABLE public.faturamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cliente_de TEXT NOT NULL,
  cliente_para TEXT NOT NULL,
  gc TEXT,
  segmento TEXT,
  valor NUMERIC(15,2) NOT NULL DEFAULT 0,
  unidade TEXT,
  setor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.faturamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view faturamento"
ON public.faturamento FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert faturamento"
ON public.faturamento FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete faturamento"
ON public.faturamento FOR DELETE TO authenticated
USING (true);
