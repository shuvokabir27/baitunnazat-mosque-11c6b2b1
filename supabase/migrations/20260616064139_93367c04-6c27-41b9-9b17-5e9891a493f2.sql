DELETE FROM public.volunteer_leads a
USING public.volunteer_leads b
WHERE a.phone = b.phone AND a.created_at > b.created_at;

ALTER TABLE public.volunteer_leads
  ADD CONSTRAINT volunteer_leads_phone_unique UNIQUE (phone);