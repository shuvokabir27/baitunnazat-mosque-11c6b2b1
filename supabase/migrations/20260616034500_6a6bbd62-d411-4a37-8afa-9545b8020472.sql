GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, UPDATE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;