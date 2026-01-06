-- Remover políticas permissivas existentes
DROP POLICY IF EXISTS "Usuários autenticados podem ver todas as ações" ON public.plano_acoes;
DROP POLICY IF EXISTS "Usuários autenticados podem criar ações" ON public.plano_acoes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar ações" ON public.plano_acoes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar ações" ON public.plano_acoes;

-- Criar políticas seguindo o padrão do CRM (owner + admin/manager)
CREATE POLICY "Users can view own plano_acoes or admins/managers can view all"
ON public.plano_acoes FOR SELECT
TO authenticated
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can insert plano_acoes"
ON public.plano_acoes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own plano_acoes or admins/managers can update all"
ON public.plano_acoes FOR UPDATE
TO authenticated
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own plano_acoes or admins can delete all"
ON public.plano_acoes FOR DELETE
TO authenticated
USING ((auth.uid() = created_by) OR has_role(auth.uid(), 'admin'));