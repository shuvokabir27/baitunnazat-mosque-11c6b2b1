CREATE OR REPLACE FUNCTION public.check_current_month_payment(_mobile text)
RETURNS TABLE(paid boolean, amount numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.donation_collections dc
      JOIN public.members m ON m.id = dc.member_id OR m.member_no = dc.member_no
      WHERE m.mobile = btrim(_mobile)
        AND dc.year = EXTRACT(YEAR FROM now())::int
        AND dc.month = EXTRACT(MONTH FROM now())::int
    ) AS paid,
    COALESCE((
      SELECT SUM(dc.amount)
      FROM public.donation_collections dc
      JOIN public.members m ON m.id = dc.member_id OR m.member_no = dc.member_no
      WHERE m.mobile = btrim(_mobile)
        AND dc.year = EXTRACT(YEAR FROM now())::int
        AND dc.month = EXTRACT(MONTH FROM now())::int
    ), 0) AS amount;
$$;

GRANT EXECUTE ON FUNCTION public.check_current_month_payment(text) TO anon, authenticated, service_role;