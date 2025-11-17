-- Create ENUM types
CREATE TYPE public.status_cliente AS ENUM ('ativo', 'inativo', 'prospecto');
CREATE TYPE public.tipo_servico AS ENUM ('maritimo', 'aereo', 'rodoviario', 'armazenagem', 'desembaraco', 'outros');
CREATE TYPE public.segmento_cliente AS ENUM ('industrial', 'comercial', 'varejo', 'tecnologia', 'outros');
CREATE TYPE public.status_oportunidade AS ENUM ('qualificacao', 'proposta', 'negociacao', 'fechamento', 'ganho', 'perdido');
CREATE TYPE public.status_contrato AS ENUM ('ativo', 'suspenso', 'encerrado', 'renovacao');
CREATE TYPE public.tipo_evento AS ENUM ('reuniao', 'follow_up', 'apresentacao', 'visita', 'outro');
CREATE TYPE public.status_visita AS ENUM ('agendada', 'realizada', 'cancelada');
CREATE TYPE public.prioridade_tarefa AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE public.status_tarefa AS ENUM ('pendente', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE public.tipo_ocorrencia AS ENUM ('reclamacao', 'duvida', 'sugestao', 'problema_tecnico', 'outro');
CREATE TYPE public.status_ocorrencia AS ENUM ('aberta', 'em_analise', 'resolvida', 'fechada');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  telefone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  segmento public.segmento_cliente NOT NULL,
  status public.status_cliente DEFAULT 'prospecto' NOT NULL,
  potencial TEXT,
  site TEXT,
  observacoes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create contatos_cliente table
CREATE TABLE public.contatos_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  is_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create cliente_servicos table
CREATE TABLE public.cliente_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  servico public.tipo_servico NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create oportunidades table
CREATE TABLE public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(15,2),
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),
  status public.status_oportunidade DEFAULT 'qualificacao' NOT NULL,
  previsao_fechamento DATE,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create contratos table
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  numero_contrato TEXT UNIQUE NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status public.status_contrato DEFAULT 'ativo' NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create contrato_servicos table
CREATE TABLE public.contrato_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE NOT NULL,
  servico public.tipo_servico NOT NULL,
  descricao TEXT,
  valor DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create eventos table
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo public.tipo_evento NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create visitas table
CREATE TABLE public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  data_visita TIMESTAMPTZ NOT NULL,
  objetivo TEXT,
  situacao_atual TEXT,
  oportunidades_identificadas TEXT,
  dores_percebidas TEXT,
  proximos_passos TEXT,
  status public.status_visita DEFAULT 'agendada' NOT NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create acoes_visita table
CREATE TABLE public.acoes_visita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES public.visitas(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  status public.status_tarefa DEFAULT 'pendente' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create tarefas table
CREATE TABLE public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade public.prioridade_tarefa DEFAULT 'media' NOT NULL,
  status public.status_tarefa DEFAULT 'pendente' NOT NULL,
  data_vencimento DATE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create pos_venda table
CREATE TABLE public.pos_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE NOT NULL,
  data_contato TIMESTAMPTZ NOT NULL,
  tipo_contato TEXT,
  observacoes TEXT,
  satisfacao INTEGER CHECK (satisfacao >= 1 AND satisfacao <= 5),
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create ocorrencias table
CREATE TABLE public.ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE NOT NULL,
  tipo public.tipo_ocorrencia NOT NULL,
  descricao TEXT NOT NULL,
  status public.status_ocorrencia DEFAULT 'aberta' NOT NULL,
  data_resolucao TIMESTAMPTZ,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create acoes_retencao table
CREATE TABLE public.acoes_retencao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  data_acao TIMESTAMPTZ NOT NULL,
  resultado TEXT,
  responsavel_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create anexos table
CREATE TABLE public.anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT,
  tamanho INTEGER,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  oportunidade_id UUID REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES public.visitas(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_clientes_cnpj ON public.clientes(cnpj);
CREATE INDEX idx_clientes_status ON public.clientes(status);
CREATE INDEX idx_contatos_cliente ON public.contatos_cliente(cliente_id);
CREATE INDEX idx_oportunidades_cliente ON public.oportunidades(cliente_id);
CREATE INDEX idx_oportunidades_status ON public.oportunidades(status);
CREATE INDEX idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX idx_visitas_cliente ON public.visitas(cliente_id);
CREATE INDEX idx_visitas_data ON public.visitas(data_visita);
CREATE INDEX idx_tarefas_responsavel ON public.tarefas(responsavel_id);
CREATE INDEX idx_tarefas_status ON public.tarefas(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_visita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_retencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for clientes (all authenticated users can view and manage)
CREATE POLICY "Authenticated users can view clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clientes" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

-- RLS Policies for contatos_cliente
CREATE POLICY "Authenticated users can view contatos" ON public.contatos_cliente FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contatos" ON public.contatos_cliente FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contatos" ON public.contatos_cliente FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contatos" ON public.contatos_cliente FOR DELETE TO authenticated USING (true);

-- RLS Policies for cliente_servicos
CREATE POLICY "Authenticated users can view servicos" ON public.cliente_servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert servicos" ON public.cliente_servicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete servicos" ON public.cliente_servicos FOR DELETE TO authenticated USING (true);

-- RLS Policies for oportunidades
CREATE POLICY "Authenticated users can view oportunidades" ON public.oportunidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert oportunidades" ON public.oportunidades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update oportunidades" ON public.oportunidades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete oportunidades" ON public.oportunidades FOR DELETE TO authenticated USING (true);

-- RLS Policies for contratos
CREATE POLICY "Authenticated users can view contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contratos" ON public.contratos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contratos" ON public.contratos FOR DELETE TO authenticated USING (true);

-- RLS Policies for contrato_servicos
CREATE POLICY "Authenticated users can view contrato_servicos" ON public.contrato_servicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contrato_servicos" ON public.contrato_servicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete contrato_servicos" ON public.contrato_servicos FOR DELETE TO authenticated USING (true);

-- RLS Policies for eventos
CREATE POLICY "Authenticated users can view eventos" ON public.eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update eventos" ON public.eventos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete eventos" ON public.eventos FOR DELETE TO authenticated USING (true);

-- RLS Policies for visitas
CREATE POLICY "Authenticated users can view visitas" ON public.visitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert visitas" ON public.visitas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update visitas" ON public.visitas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete visitas" ON public.visitas FOR DELETE TO authenticated USING (true);

-- RLS Policies for acoes_visita
CREATE POLICY "Authenticated users can view acoes_visita" ON public.acoes_visita FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert acoes_visita" ON public.acoes_visita FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update acoes_visita" ON public.acoes_visita FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete acoes_visita" ON public.acoes_visita FOR DELETE TO authenticated USING (true);

-- RLS Policies for tarefas
CREATE POLICY "Authenticated users can view tarefas" ON public.tarefas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tarefas" ON public.tarefas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tarefas" ON public.tarefas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tarefas" ON public.tarefas FOR DELETE TO authenticated USING (true);

-- RLS Policies for pos_venda
CREATE POLICY "Authenticated users can view pos_venda" ON public.pos_venda FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pos_venda" ON public.pos_venda FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update pos_venda" ON public.pos_venda FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete pos_venda" ON public.pos_venda FOR DELETE TO authenticated USING (true);

-- RLS Policies for ocorrencias
CREATE POLICY "Authenticated users can view ocorrencias" ON public.ocorrencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ocorrencias" ON public.ocorrencias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ocorrencias" ON public.ocorrencias FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ocorrencias" ON public.ocorrencias FOR DELETE TO authenticated USING (true);

-- RLS Policies for acoes_retencao
CREATE POLICY "Authenticated users can view acoes_retencao" ON public.acoes_retencao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert acoes_retencao" ON public.acoes_retencao FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update acoes_retencao" ON public.acoes_retencao FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete acoes_retencao" ON public.acoes_retencao FOR DELETE TO authenticated USING (true);

-- RLS Policies for anexos
CREATE POLICY "Authenticated users can view anexos" ON public.anexos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert anexos" ON public.anexos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete anexos" ON public.anexos FOR DELETE TO authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contatos_cliente FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.eventos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.visitas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ocorrencias FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();