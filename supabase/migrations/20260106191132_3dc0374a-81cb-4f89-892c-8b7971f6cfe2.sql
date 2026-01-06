-- Criar enum para modalidade de visita
CREATE TYPE public.modalidade_visita AS ENUM ('presencial', 'remota');

-- Adicionar coluna modalidade na tabela visitas
ALTER TABLE public.visitas ADD COLUMN modalidade public.modalidade_visita DEFAULT 'presencial';

-- Criar enum para status das ações
CREATE TYPE public.status_acao AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');

-- Criar enum para prioridade das ações
CREATE TYPE public.prioridade_acao AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Criar tabela de plano de ações
CREATE TABLE public.plano_acoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status public.status_acao NOT NULL DEFAULT 'pendente',
  prioridade public.prioridade_acao NOT NULL DEFAULT 'media',
  data_limite DATE,
  responsavel_id UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.plano_acoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plano_acoes
CREATE POLICY "Usuários autenticados podem ver todas as ações"
ON public.plano_acoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar ações"
ON public.plano_acoes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar ações"
ON public.plano_acoes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar ações"
ON public.plano_acoes FOR DELETE
TO authenticated
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_plano_acoes_updated_at
BEFORE UPDATE ON public.plano_acoes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();