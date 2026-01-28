-- Drop existing delete policy
DROP POLICY IF EXISTS "Admins and managers can delete items" ON public.pre_alerta_itens;

-- Create new policy that allows creators OR admins/managers to delete
CREATE POLICY "Users can delete own items or admins/managers can delete all"
ON public.pre_alerta_itens
FOR DELETE
USING (
  auth.uid() = created_by OR is_admin_or_manager(auth.uid())
);