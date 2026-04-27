-- Concede role admin para eduarda.cruz@intermaritima.com.br assim que ela se cadastrar (ou agora, se já existir)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'eduarda.cruz@intermaritima.com.br' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Trigger para garantir admin automático quando ela se cadastrar
CREATE OR REPLACE FUNCTION public.assign_eduarda_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'eduarda.cruz@intermaritima.com.br' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_eduarda ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_eduarda
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_eduarda_admin();