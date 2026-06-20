GRANT SELECT ON public.member_addresses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_addresses TO authenticated;
GRANT ALL ON public.member_addresses TO service_role;