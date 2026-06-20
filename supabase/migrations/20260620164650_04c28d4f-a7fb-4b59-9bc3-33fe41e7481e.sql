-- Add a permanent, stable member number
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_no integer;

-- Create a sequence for member numbers
CREATE SEQUENCE IF NOT EXISTS public.members_member_no_seq;

-- Backfill existing members in created_at order
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.members
)
UPDATE public.members m
SET member_no = o.rn
FROM ordered o
WHERE m.id = o.id AND m.member_no IS NULL;

-- Advance the sequence past existing max
SELECT setval('public.members_member_no_seq', COALESCE((SELECT MAX(member_no) FROM public.members), 0));

-- Set default for new rows and enforce
ALTER TABLE public.members ALTER COLUMN member_no SET DEFAULT nextval('public.members_member_no_seq');
ALTER TABLE public.members ALTER COLUMN member_no SET NOT NULL;
ALTER TABLE public.members ADD CONSTRAINT members_member_no_unique UNIQUE (member_no);

-- Update verify function to use the stored member_no
CREATE OR REPLACE FUNCTION public.verify_member_by_mobile(_mobile text)
 RETURNS TABLE(member_no bigint, name text, father_name text, address text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT m.member_no::bigint, m.name, m.father_name, m.address
  FROM public.members m
  WHERE m.mobile = btrim(_mobile)
  LIMIT 1
$function$;