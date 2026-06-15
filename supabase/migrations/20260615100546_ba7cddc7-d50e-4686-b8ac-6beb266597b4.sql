REVOKE EXECUTE ON FUNCTION public.increment_reaction(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_reaction(text, text) TO service_role;