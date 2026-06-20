DROP POLICY IF EXISTS "Anyone can view members" ON public.members;

CREATE POLICY "Admins can view members" ON public.members
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));