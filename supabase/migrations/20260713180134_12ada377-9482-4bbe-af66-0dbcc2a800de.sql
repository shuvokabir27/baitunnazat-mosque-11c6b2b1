ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

CREATE TABLE public.staff_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username text NOT NULL UNIQUE,
  pin text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_accounts TO authenticated;
GRANT ALL ON public.staff_accounts TO service_role;

ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage staff accounts"
ON public.staff_accounts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_staff_accounts_updated_at
BEFORE UPDATE ON public.staff_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();