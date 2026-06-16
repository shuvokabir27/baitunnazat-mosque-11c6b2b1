GRANT INSERT ON public.volunteer_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_leads TO authenticated;
GRANT ALL ON public.volunteer_leads TO service_role;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.volunteer_leads;
CREATE POLICY "Anyone can submit volunteer leads"
ON public.volunteer_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);