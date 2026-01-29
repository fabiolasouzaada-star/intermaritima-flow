
-- Criar enum para tipo de reunião
CREATE TYPE public.tipo_reuniao AS ENUM ('comercial', 'operacional', 'qualidade', 'estrategica', 'crise');

-- Criar enum para área envolvida
CREATE TYPE public.area_envolvida AS ENUM ('comercial', 'inter_i_tps', 'transporte', 'cdex', 'porto', 'qualidade', 'financeiro');

-- Criar enum para status de reunião
CREATE TYPE public.status_reuniao AS ENUM ('realizada', 'em_andamento', 'cancelada');

-- Criar enum para prioridade de ação
CREATE TYPE public.prioridade_acao_reuniao AS ENUM ('alta', 'media', 'baixa');

-- Criar enum para status de ação
CREATE TYPE public.status_acao_reuniao AS ENUM ('nao_iniciada', 'em_andamento', 'concluida', 'atrasada');

-- Criar enum para impacto da ação
CREATE TYPE public.impacto_acao AS ENUM ('financeiro', 'operacional', 'relacionamento_cliente', 'compliance');

-- Criar enum para status de tarefa de ação
CREATE TYPE public.status_tarefa_acao AS ENUM ('nao_iniciada', 'em_andamento', 'concluida', 'atrasada');

-- 1) TABELA: REUNIÕES
CREATE TABLE public.reunioes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_reuniao timestamp with time zone NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo tipo_reuniao NOT NULL,
  area_envolvida area_envolvida NOT NULL,
  participantes text,
  objetivo text,
  resumo text,
  status status_reuniao NOT NULL DEFAULT 'em_andamento',
  proxima_reuniao timestamp with time zone,
  observacoes_estrategicas text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2) TABELA: PLANO DE AÇÃO (vinculada a reunião)
CREATE TABLE public.acoes_reuniao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id uuid REFERENCES public.reunioes(id) ON DELETE CASCADE NOT NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  area_responsavel area_envolvida NOT NULL,
  acao text NOT NULL,
  responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  prazo date,
  prioridade prioridade_acao_reuniao NOT NULL DEFAULT 'media',
  status status_acao_reuniao NOT NULL DEFAULT 'nao_iniciada',
  impacto impacto_acao,
  comentarios text,
  data_conclusao date,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3) TABELA: TAREFAS (vinculada a ação)
CREATE TABLE public.tarefas_acao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id uuid REFERENCES public.acoes_reuniao(id) ON DELETE CASCADE NOT NULL,
  descricao text NOT NULL,
  responsavel_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_inicio timestamp with time zone,
  data_final timestamp with time zone,
  status status_tarefa_acao NOT NULL DEFAULT 'nao_iniciada',
  sla_horas integer,
  alerta_atraso boolean DEFAULT false,
  comentarios text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_reuniao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_acao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reunioes
CREATE POLICY "Users can view own reunioes or admins/managers can view all"
ON public.reunioes FOR SELECT
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert reunioes"
ON public.reunioes FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own reunioes or admins/managers can update all"
ON public.reunioes FOR UPDATE
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own reunioes or admins can delete all"
ON public.reunioes FOR DELETE
USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'admin'));

-- Políticas RLS para acoes_reuniao
CREATE POLICY "Users can view own acoes_reuniao or admins/managers can view all"
ON public.acoes_reuniao FOR SELECT
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert acoes_reuniao"
ON public.acoes_reuniao FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own acoes_reuniao or admins/managers can update all"
ON public.acoes_reuniao FOR UPDATE
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own acoes_reuniao or admins can delete all"
ON public.acoes_reuniao FOR DELETE
USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'admin'));

-- Políticas RLS para tarefas_acao
CREATE POLICY "Users can view own tarefas_acao or admins/managers can view all"
ON public.tarefas_acao FOR SELECT
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert tarefas_acao"
ON public.tarefas_acao FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tarefas_acao or admins/managers can update all"
ON public.tarefas_acao FOR UPDATE
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own tarefas_acao or admins can delete all"
ON public.tarefas_acao FOR DELETE
USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_reunioes_updated_at
  BEFORE UPDATE ON public.reunioes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_acoes_reuniao_updated_at
  BEFORE UPDATE ON public.acoes_reuniao
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tarefas_acao_updated_at
  BEFORE UPDATE ON public.tarefas_acao
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para atualizar status de ação/tarefa para atrasada automaticamente
CREATE OR REPLACE FUNCTION public.check_overdue_acoes_tarefas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar ações atrasadas
  UPDATE public.acoes_reuniao
  SET status = 'atrasada', updated_at = now()
  WHERE status NOT IN ('concluida', 'atrasada')
    AND prazo < CURRENT_DATE;

  -- Atualizar tarefas atrasadas
  UPDATE public.tarefas_acao
  SET status = 'atrasada', alerta_atraso = true, updated_at = now()
  WHERE status NOT IN ('concluida', 'atrasada')
    AND data_final < now();
END;
$$;
