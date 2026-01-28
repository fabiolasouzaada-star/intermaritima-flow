-- Add terminal_direcionamento column to pre_alerta_itens
ALTER TABLE public.pre_alerta_itens 
ADD COLUMN IF NOT EXISTS terminal_direcionamento text DEFAULT 'sem_direcionamento';