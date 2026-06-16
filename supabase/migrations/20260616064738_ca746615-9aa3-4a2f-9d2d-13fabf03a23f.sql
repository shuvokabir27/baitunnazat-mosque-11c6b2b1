ALTER TABLE public.volunteer_leads ADD COLUMN called boolean NOT NULL DEFAULT false;

-- Update RLS policies to allow admins to update the called status
-- The existing SELECT and DELETE policies are fine, but we need an UPDATE policy
CREATE POLICY "Admins can update called status"
  ON public.volunteer_leads FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  ));