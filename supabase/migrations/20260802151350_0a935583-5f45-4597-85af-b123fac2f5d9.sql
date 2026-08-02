CREATE OR REPLACE FUNCTION public.member_payment_history(_mobile text)
RETURNS TABLE(year integer, month integer, amount numeric, collected_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dc.year, dc.month, dc.amount, dc.collected_at
  FROM public.donation_collections dc
  JOIN public.members m ON m.id = dc.member_id
  WHERE btrim(m.mobile) = btrim(_mobile)
    AND btrim(_mobile) ~ '^[0-9]{11}$'
  ORDER BY dc.year DESC, dc.month DESC;
$$;

GRANT EXECUTE ON FUNCTION public.member_payment_history(text) TO anon, authenticated;