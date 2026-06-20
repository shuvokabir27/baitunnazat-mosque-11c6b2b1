DROP POLICY IF EXISTS "Anyone can add addresses" ON public.member_addresses;

CREATE POLICY "Admins can add addresses" ON public.member_addresses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete addresses" ON public.member_addresses
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));