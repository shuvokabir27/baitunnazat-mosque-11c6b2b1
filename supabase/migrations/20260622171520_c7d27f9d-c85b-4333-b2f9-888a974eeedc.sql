CREATE TABLE public.donation_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  member_no integer,
  member_name text NOT NULL,
  mobile text,
  amount numeric NOT NULL DEFAULT 0,
  year integer NOT NULL,
  month integer NOT NULL,
  note text,
  collected_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_collections TO authenticated;
GRANT ALL ON public.donation_collections TO service_role;

ALTER TABLE public.donation_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage donation collections"
ON public.donation_collections FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_donation_collections_updated_at
BEFORE UPDATE ON public.donation_collections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_donation_collections_period ON public.donation_collections(year, month);