
DROP POLICY "Authenticated users can insert faturamento" ON public.faturamento;
DROP POLICY "Authenticated users can delete faturamento" ON public.faturamento;

CREATE POLICY "Authenticated users can insert faturamento"
ON public.faturamento FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete faturamento"
ON public.faturamento FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);
