DROP POLICY "Admins can view leads" ON public.volunteer_leads;
DROP POLICY "Admins can delete leads" ON public.volunteer_leads;

CREATE POLICY "Admins can view leads"
  ON public.volunteer_leads FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));

CREATE POLICY "Admins can delete leads"
  ON public.volunteer_leads FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));