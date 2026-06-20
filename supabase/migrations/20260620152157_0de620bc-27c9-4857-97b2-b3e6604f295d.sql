CREATE TABLE public.member_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.member_addresses TO anon, authenticated;
GRANT ALL ON public.member_addresses TO service_role;
ALTER TABLE public.member_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view addresses" ON public.member_addresses FOR SELECT USING (true);
CREATE POLICY "Anyone can add addresses" ON public.member_addresses FOR INSERT WITH CHECK (true);

CREATE TABLE public.members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  father_name text NOT NULL,
  mobile text NOT NULL,
  address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.members TO anon, authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Anyone can add members" ON public.members FOR INSERT WITH CHECK (true);