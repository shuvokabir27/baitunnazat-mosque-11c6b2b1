CREATE OR REPLACE FUNCTION public.verify_member_by_mobile(_mobile text)
RETURNS TABLE (name text, father_name text, address text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.name, m.father_name, m.address
  FROM public.members m
  WHERE m.mobile = btrim(_mobile)
  ORDER BY m.created_at DESC
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.verify_member_by_mobile(text) TO anon, authenticated;