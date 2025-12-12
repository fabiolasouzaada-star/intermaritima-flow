-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- 6. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add created_by to tables that don't have it
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.oportunidades ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.visitas ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.pos_venda ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.propostas_cliente ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.pipeline_retomada ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.acoes_retencao ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.ocorrencias ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.anexos ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 8. Drop existing overly permissive policies and create owner-scoped ones

-- CLIENTES
DROP POLICY IF EXISTS "Authenticated users can view clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can update clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can delete clientes" ON public.clientes;

CREATE POLICY "Users can view own clientes or admins/managers can view all"
ON public.clientes FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert clientes"
ON public.clientes FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own clientes or admins/managers can update all"
ON public.clientes FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own clientes or admins can delete all"
ON public.clientes FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- CONTRATOS
DROP POLICY IF EXISTS "Authenticated users can view contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can insert contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can update contratos" ON public.contratos;
DROP POLICY IF EXISTS "Authenticated users can delete contratos" ON public.contratos;

CREATE POLICY "Users can view own contratos or admins/managers can view all"
ON public.contratos FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert contratos"
ON public.contratos FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own contratos or admins/managers can update all"
ON public.contratos FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own contratos or admins can delete all"
ON public.contratos FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- OPORTUNIDADES
DROP POLICY IF EXISTS "Authenticated users can view oportunidades" ON public.oportunidades;
DROP POLICY IF EXISTS "Authenticated users can insert oportunidades" ON public.oportunidades;
DROP POLICY IF EXISTS "Authenticated users can update oportunidades" ON public.oportunidades;
DROP POLICY IF EXISTS "Authenticated users can delete oportunidades" ON public.oportunidades;

CREATE POLICY "Users can view own oportunidades or admins/managers can view all"
ON public.oportunidades FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert oportunidades"
ON public.oportunidades FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own oportunidades or admins/managers can update all"
ON public.oportunidades FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own oportunidades or admins can delete all"
ON public.oportunidades FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- VISITAS
DROP POLICY IF EXISTS "Authenticated users can view visitas" ON public.visitas;
DROP POLICY IF EXISTS "Authenticated users can insert visitas" ON public.visitas;
DROP POLICY IF EXISTS "Authenticated users can update visitas" ON public.visitas;
DROP POLICY IF EXISTS "Authenticated users can delete visitas" ON public.visitas;

CREATE POLICY "Users can view own visitas or admins/managers can view all"
ON public.visitas FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert visitas"
ON public.visitas FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own visitas or admins/managers can update all"
ON public.visitas FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own visitas or admins can delete all"
ON public.visitas FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- TAREFAS
DROP POLICY IF EXISTS "Authenticated users can view tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Authenticated users can insert tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Authenticated users can update tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Authenticated users can delete tarefas" ON public.tarefas;

CREATE POLICY "Users can view own tarefas or admins/managers can view all"
ON public.tarefas FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert tarefas"
ON public.tarefas FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tarefas or admins/managers can update all"
ON public.tarefas FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own tarefas or admins can delete all"
ON public.tarefas FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- EVENTOS
DROP POLICY IF EXISTS "Authenticated users can view eventos" ON public.eventos;
DROP POLICY IF EXISTS "Authenticated users can insert eventos" ON public.eventos;
DROP POLICY IF EXISTS "Authenticated users can update eventos" ON public.eventos;
DROP POLICY IF EXISTS "Authenticated users can delete eventos" ON public.eventos;

CREATE POLICY "Users can view own eventos or admins/managers can view all"
ON public.eventos FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert eventos"
ON public.eventos FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own eventos or admins/managers can update all"
ON public.eventos FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own eventos or admins can delete all"
ON public.eventos FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- PROPOSTAS_CLIENTE
DROP POLICY IF EXISTS "Authenticated users can view propostas" ON public.propostas_cliente;
DROP POLICY IF EXISTS "Authenticated users can insert propostas" ON public.propostas_cliente;
DROP POLICY IF EXISTS "Authenticated users can update propostas" ON public.propostas_cliente;
DROP POLICY IF EXISTS "Authenticated users can delete propostas" ON public.propostas_cliente;

CREATE POLICY "Users can view own propostas or admins/managers can view all"
ON public.propostas_cliente FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert propostas"
ON public.propostas_cliente FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own propostas or admins/managers can update all"
ON public.propostas_cliente FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own propostas or admins can delete all"
ON public.propostas_cliente FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- POS_VENDA
DROP POLICY IF EXISTS "Authenticated users can view pos_venda" ON public.pos_venda;
DROP POLICY IF EXISTS "Authenticated users can insert pos_venda" ON public.pos_venda;
DROP POLICY IF EXISTS "Authenticated users can update pos_venda" ON public.pos_venda;
DROP POLICY IF EXISTS "Authenticated users can delete pos_venda" ON public.pos_venda;

CREATE POLICY "Users can view own pos_venda or admins/managers can view all"
ON public.pos_venda FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert pos_venda"
ON public.pos_venda FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own pos_venda or admins/managers can update all"
ON public.pos_venda FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own pos_venda or admins can delete all"
ON public.pos_venda FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- PIPELINE_RETOMADA
DROP POLICY IF EXISTS "Authenticated users can view pipeline_retomada" ON public.pipeline_retomada;
DROP POLICY IF EXISTS "Authenticated users can insert pipeline_retomada" ON public.pipeline_retomada;
DROP POLICY IF EXISTS "Authenticated users can update pipeline_retomada" ON public.pipeline_retomada;
DROP POLICY IF EXISTS "Authenticated users can delete pipeline_retomada" ON public.pipeline_retomada;

CREATE POLICY "Users can view own pipeline_retomada or admins/managers can view all"
ON public.pipeline_retomada FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert pipeline_retomada"
ON public.pipeline_retomada FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own pipeline_retomada or admins/managers can update all"
ON public.pipeline_retomada FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own pipeline_retomada or admins can delete all"
ON public.pipeline_retomada FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ACOES_RETENCAO
DROP POLICY IF EXISTS "Authenticated users can view acoes_retencao" ON public.acoes_retencao;
DROP POLICY IF EXISTS "Authenticated users can insert acoes_retencao" ON public.acoes_retencao;
DROP POLICY IF EXISTS "Authenticated users can update acoes_retencao" ON public.acoes_retencao;
DROP POLICY IF EXISTS "Authenticated users can delete acoes_retencao" ON public.acoes_retencao;

CREATE POLICY "Users can view own acoes_retencao or admins/managers can view all"
ON public.acoes_retencao FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert acoes_retencao"
ON public.acoes_retencao FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own acoes_retencao or admins/managers can update all"
ON public.acoes_retencao FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own acoes_retencao or admins can delete all"
ON public.acoes_retencao FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- OCORRENCIAS
DROP POLICY IF EXISTS "Authenticated users can view ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Authenticated users can insert ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Authenticated users can update ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Authenticated users can delete ocorrencias" ON public.ocorrencias;

CREATE POLICY "Users can view own ocorrencias or admins/managers can view all"
ON public.ocorrencias FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert ocorrencias"
ON public.ocorrencias FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own ocorrencias or admins/managers can update all"
ON public.ocorrencias FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own ocorrencias or admins can delete all"
ON public.ocorrencias FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- ANEXOS
DROP POLICY IF EXISTS "Authenticated users can view anexos" ON public.anexos;
DROP POLICY IF EXISTS "Authenticated users can insert anexos" ON public.anexos;
DROP POLICY IF EXISTS "Authenticated users can delete anexos" ON public.anexos;

CREATE POLICY "Users can view own anexos or admins/managers can view all"
ON public.anexos FOR SELECT
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert anexos"
ON public.anexos FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own anexos or admins/managers can update all"
ON public.anexos FOR UPDATE
USING (auth.uid() = created_by OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own anexos or admins can delete all"
ON public.anexos FOR DELETE
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- CONTATOS_CLIENTE (access follows parent cliente)
DROP POLICY IF EXISTS "Authenticated users can view contatos" ON public.contatos_cliente;
DROP POLICY IF EXISTS "Authenticated users can insert contatos" ON public.contatos_cliente;
DROP POLICY IF EXISTS "Authenticated users can update contatos" ON public.contatos_cliente;
DROP POLICY IF EXISTS "Authenticated users can delete contatos" ON public.contatos_cliente;

CREATE POLICY "Users can view contatos of own clientes or admins/managers can view all"
ON public.contatos_cliente FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = contatos_cliente.cliente_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can insert contatos for own clientes"
ON public.contatos_cliente FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = contatos_cliente.cliente_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can update contatos of own clientes or admins/managers can update all"
ON public.contatos_cliente FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = contatos_cliente.cliente_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete contatos of own clientes or admins can delete all"
ON public.contatos_cliente FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = contatos_cliente.cliente_id 
    AND (c.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- CLIENTE_SERVICOS (access follows parent cliente)
DROP POLICY IF EXISTS "Authenticated users can view servicos" ON public.cliente_servicos;
DROP POLICY IF EXISTS "Authenticated users can insert servicos" ON public.cliente_servicos;
DROP POLICY IF EXISTS "Authenticated users can delete servicos" ON public.cliente_servicos;

CREATE POLICY "Users can view servicos of own clientes or admins/managers can view all"
ON public.cliente_servicos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_servicos.cliente_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can insert servicos for own clientes"
ON public.cliente_servicos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_servicos.cliente_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete servicos of own clientes or admins can delete all"
ON public.cliente_servicos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c 
    WHERE c.id = cliente_servicos.cliente_id 
    AND (c.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- CONTRATO_SERVICOS (access follows parent contrato)
DROP POLICY IF EXISTS "Authenticated users can view contrato_servicos" ON public.contrato_servicos;
DROP POLICY IF EXISTS "Authenticated users can insert contrato_servicos" ON public.contrato_servicos;
DROP POLICY IF EXISTS "Authenticated users can delete contrato_servicos" ON public.contrato_servicos;

CREATE POLICY "Users can view contrato_servicos of own contratos or admins/managers can view all"
ON public.contrato_servicos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contratos c 
    WHERE c.id = contrato_servicos.contrato_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can insert contrato_servicos for own contratos"
ON public.contrato_servicos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contratos c 
    WHERE c.id = contrato_servicos.contrato_id 
    AND (c.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete contrato_servicos of own contratos or admins can delete all"
ON public.contrato_servicos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.contratos c 
    WHERE c.id = contrato_servicos.contrato_id 
    AND (c.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- ACOES_VISITA (access follows parent visita)
DROP POLICY IF EXISTS "Authenticated users can view acoes_visita" ON public.acoes_visita;
DROP POLICY IF EXISTS "Authenticated users can insert acoes_visita" ON public.acoes_visita;
DROP POLICY IF EXISTS "Authenticated users can update acoes_visita" ON public.acoes_visita;
DROP POLICY IF EXISTS "Authenticated users can delete acoes_visita" ON public.acoes_visita;

CREATE POLICY "Users can view acoes_visita of own visitas or admins/managers can view all"
ON public.acoes_visita FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.visitas v 
    WHERE v.id = acoes_visita.visita_id 
    AND (v.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can insert acoes_visita for own visitas"
ON public.acoes_visita FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.visitas v 
    WHERE v.id = acoes_visita.visita_id 
    AND (v.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can update acoes_visita of own visitas or admins/managers can update all"
ON public.acoes_visita FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.visitas v 
    WHERE v.id = acoes_visita.visita_id 
    AND (v.created_by = auth.uid() OR public.is_admin_or_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete acoes_visita of own visitas or admins can delete all"
ON public.acoes_visita FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.visitas v 
    WHERE v.id = acoes_visita.visita_id 
    AND (v.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- 9. Storage policies for propostas bucket (owner-scoped)
DROP POLICY IF EXISTS "Authenticated users can read propostas files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload propostas files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update propostas files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete propostas files" ON storage.objects;

CREATE POLICY "Users can read own propostas files or admins/managers can read all"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'propostas' AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR public.is_admin_or_manager(auth.uid())
  )
);

CREATE POLICY "Users can upload to own folder in propostas"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'propostas' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own propostas files or admins can update all"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'propostas' AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can delete own propostas files or admins can delete all"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'propostas' AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR public.has_role(auth.uid(), 'admin')
  )
);