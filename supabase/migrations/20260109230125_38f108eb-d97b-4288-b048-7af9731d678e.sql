-- Add new status 'sem_retorno' to status_oportunidade enum
ALTER TYPE public.status_oportunidade ADD VALUE IF NOT EXISTS 'sem_retorno' AFTER 'perdido';

-- Create a function to auto-move stale opportunities to sem_retorno
CREATE OR REPLACE FUNCTION public.check_stale_opportunities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Move opportunities that haven't been updated in 30+ days
  -- and are not in 'ganho', 'perdido', or 'sem_retorno' status
  UPDATE public.oportunidades
  SET status = 'sem_retorno',
      updated_at = now()
  WHERE status NOT IN ('ganho', 'perdido', 'sem_retorno')
    AND updated_at < now() - interval '30 days';
END;
$$;