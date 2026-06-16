DROP POLICY "Anyone can submit a lead" ON public.volunteer_leads;

CREATE POLICY "Anyone can submit a lead"
  ON public.volunteer_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(phone) BETWEEN 6 AND 20
    AND (name IS NULL OR char_length(name) <= 100)
  );