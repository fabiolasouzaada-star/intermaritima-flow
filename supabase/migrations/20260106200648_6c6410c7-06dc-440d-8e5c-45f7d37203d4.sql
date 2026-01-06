
-- Criar função específica para verificar se é ADM
CREATE OR REPLACE FUNCTION public.is_adm(_user_id uuid)
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
      AND role = 'adm'
  )
$$;

-- Atualizar a função is_admin_or_manager para incluir adm (para leitura)
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
      AND role IN ('admin', 'manager', 'adm')
  )
$$;

-- Permitir que ADM possa inserir clientes
DROP POLICY IF EXISTS "Users can insert clientes" ON public.clientes;
CREATE POLICY "Users can insert clientes" ON public.clientes
FOR INSERT WITH CHECK (
  auth.uid() = created_by OR is_adm(auth.uid()) OR has_role(auth.uid(), 'admin')
);

-- Permitir que ADM possa inserir plano_acoes para qualquer cliente
DROP POLICY IF EXISTS "Users can insert plano_acoes" ON public.plano_acoes;
CREATE POLICY "Users can insert plano_acoes" ON public.plano_acoes
FOR INSERT WITH CHECK (
  auth.uid() = created_by OR is_adm(auth.uid()) OR has_role(auth.uid(), 'admin')
);

-- Restringir ADM de atualizar propostas (apenas admin e manager podem)
DROP POLICY IF EXISTS "Users can update own propostas or admins/managers can update al" ON public.propostas;
CREATE POLICY "Users can update own propostas or admins can update all" ON public.propostas
FOR UPDATE USING (
  (auth.uid() = created_by) OR 
  (has_role(auth.uid(), 'admin')) OR 
  (has_role(auth.uid(), 'manager'))
);

-- Restringir ADM de atualizar oportunidades (apenas admin e manager podem)
DROP POLICY IF EXISTS "Users can update own oportunidades or admins/managers can updat" ON public.oportunidades;
CREATE POLICY "Users can update own oportunidades or admins can update" ON public.oportunidades
FOR UPDATE USING (
  (auth.uid() = created_by) OR 
  (has_role(auth.uid(), 'admin')) OR 
  (has_role(auth.uid(), 'manager'))
);

-- Restringir ADM de atualizar contratos (apenas admin e manager podem)
DROP POLICY IF EXISTS "Users can update own contratos or admins/managers can update al" ON public.contratos;
CREATE POLICY "Users can update own contratos or admins can update" ON public.contratos
FOR UPDATE USING (
  (auth.uid() = created_by) OR 
  (has_role(auth.uid(), 'admin')) OR 
  (has_role(auth.uid(), 'manager'))
);
