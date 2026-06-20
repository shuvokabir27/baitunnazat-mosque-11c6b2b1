DROP FUNCTION IF EXISTS public.verify_member_by_mobile(text);

CREATE OR REPLACE FUNCTION public.verify_member_by_mobile(_mobile text)
 RETURNS TABLE(member_no bigint, name text, father_name text, address text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH ranked AS (
    SELECT
      m.mobile,
      m.name,
      m.father_name,
      m.address,
      ROW_NUMBER() OVER (ORDER BY m.created_at ASC) AS member_no
    FROM public.members m
  )
  SELECT r.member_no, r.name, r.father_name, r.address
  FROM ranked r
  WHERE r.mobile = btrim(_mobile)
  LIMIT 1
$function$;