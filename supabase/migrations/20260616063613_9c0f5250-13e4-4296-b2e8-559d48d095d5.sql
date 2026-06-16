CREATE TABLE public.volunteer_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_leads TO authenticated;
GRANT INSERT ON public.volunteer_leads TO anon;
GRANT ALL ON public.volunteer_leads TO service_role;

ALTER TABLE public.volunteer_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.volunteer_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view leads"
  ON public.volunteer_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.volunteer_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));