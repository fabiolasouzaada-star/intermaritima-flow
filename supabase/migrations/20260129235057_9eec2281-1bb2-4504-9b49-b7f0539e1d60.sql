-- Add responsavel_nome column to acoes_reuniao table for manual name input
ALTER TABLE public.acoes_reuniao 
ADD COLUMN IF NOT EXISTS responsavel_nome text;