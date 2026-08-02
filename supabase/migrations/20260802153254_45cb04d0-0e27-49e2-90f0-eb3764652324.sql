ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS account_override text CHECK (account_override IN ('active','suspended')),
  ADD COLUMN IF NOT EXISTS account_note text;

DROP FUNCTION IF EXISTS public.verify_member_by_mobile(text);

CREATE FUNCTION public.verify_member_by_mobile(_mobile text)
 RETURNS TABLE(member_no bigint, name text, father_name text, address text, monthly_donation numeric, account_override text, account_note text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT m.member_no::bigint, m.name, m.father_name, m.address, m.monthly_donation, m.account_override, m.account_note
  FROM public.members m
  WHERE m.mobile = btrim(_mobile)
  LIMIT 1
$function$;