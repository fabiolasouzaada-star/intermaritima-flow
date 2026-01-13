-- Fix overly permissive UPDATE policy - restrict to owner or admins/managers
DROP POLICY IF EXISTS "Authenticated users can update items" ON public.pre_alerta_itens;

CREATE POLICY "Users can update own items or admins/managers"
ON public.pre_alerta_itens FOR UPDATE
TO authenticated
USING ((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()));