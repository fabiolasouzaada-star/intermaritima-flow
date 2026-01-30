-- Adicionar coluna areas_responsaveis (array de texto) para multi-seleção de áreas
ALTER TABLE public.acoes_reuniao 
ADD COLUMN areas_responsaveis text[] DEFAULT '{}'::text[];