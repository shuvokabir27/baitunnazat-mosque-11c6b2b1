DROP FUNCTION IF EXISTS public.verify_member_by_mobile(text);

CREATE FUNCTION public.verify_member_by_mobile(_mobile text)
 RETURNS TABLE(member_no bigint, name text, father_name text, address text, monthly_donation numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT m.member_no::bigint, m.name, m.father_name, m.address, m.monthly_donation
  FROM public.members m
  WHERE m.mobile = btrim(_mobile)
  LIMIT 1
$function$;