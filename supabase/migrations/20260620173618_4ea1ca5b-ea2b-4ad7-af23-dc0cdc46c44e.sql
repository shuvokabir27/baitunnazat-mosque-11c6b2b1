CREATE TABLE public.masala_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_slug text NOT NULL,
  scholar_name text NOT NULL,
  scholar_role text NOT NULL,
  subject text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.masala_requests TO anon, authenticated;
GRANT SELECT, DELETE ON public.masala_requests TO authenticated;
GRANT ALL ON public.masala_requests TO service_role;

ALTER TABLE public.masala_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a masala request"
ON public.masala_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view masala requests"
ON public.masala_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete masala requests"
ON public.masala_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_masala_requests_created_at ON public.masala_requests (created_at DESC);