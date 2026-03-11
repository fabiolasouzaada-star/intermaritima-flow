ALTER TABLE public.faturamento ALTER COLUMN cliente_de SET DEFAULT '';
ALTER TABLE public.faturamento ALTER COLUMN cliente_de DROP NOT NULL;