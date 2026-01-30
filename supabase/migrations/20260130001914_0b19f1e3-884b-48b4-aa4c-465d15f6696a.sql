-- Adicionar coluna areas (array de texto) para multi-seleção de áreas envolvidas
ALTER TABLE public.plano_acoes 
ADD COLUMN areas text[] DEFAULT NULL;