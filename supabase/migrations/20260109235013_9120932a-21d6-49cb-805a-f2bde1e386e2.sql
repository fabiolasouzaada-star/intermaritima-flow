-- Remover o valor padrão atual
ALTER TABLE public.plano_acoes 
ALTER COLUMN status DROP DEFAULT;

-- Alterar a coluna status para text temporariamente para permitir a migração
ALTER TABLE public.plano_acoes 
ALTER COLUMN status TYPE text USING status::text;

-- Atualizar os valores existentes para os novos status do Pipeline
UPDATE public.plano_acoes SET status = 'qualificacao' WHERE status = 'pendente';
UPDATE public.plano_acoes SET status = 'proposta' WHERE status = 'em_andamento';
UPDATE public.plano_acoes SET status = 'ganho' WHERE status = 'concluida';
UPDATE public.plano_acoes SET status = 'perdido' WHERE status = 'cancelada';

-- Alterar a coluna para usar o enum status_oportunidade
ALTER TABLE public.plano_acoes 
ALTER COLUMN status TYPE public.status_oportunidade USING status::public.status_oportunidade;

-- Definir o novo valor padrão
ALTER TABLE public.plano_acoes 
ALTER COLUMN status SET DEFAULT 'qualificacao'::public.status_oportunidade;