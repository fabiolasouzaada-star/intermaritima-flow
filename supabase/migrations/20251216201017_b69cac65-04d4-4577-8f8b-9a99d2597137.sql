-- Adicionar campos para motivo e descrição da perda em oportunidades
ALTER TABLE public.oportunidades 
ADD COLUMN IF NOT EXISTS motivo_perda text,
ADD COLUMN IF NOT EXISTS descricao_perda text;