-- Adicionar coluna tipo_servico à tabela plano_acoes
ALTER TABLE public.plano_acoes 
ADD COLUMN tipo_servico text;

-- Criar índice para melhorar performance de filtros
CREATE INDEX idx_plano_acoes_tipo_servico ON public.plano_acoes(tipo_servico);