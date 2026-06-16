GRANT INSERT ON public.volunteer_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_leads TO authenticated;
GRANT ALL ON public.volunteer_leads TO service_role;