CREATE TABLE public.profile_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('love','like')),
  count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (slug, kind)
);

GRANT SELECT ON public.profile_reactions TO anon, authenticated;
GRANT ALL ON public.profile_reactions TO service_role;

ALTER TABLE public.profile_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions"
ON public.profile_reactions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.increment_reaction(_slug text, _kind text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF _kind NOT IN ('love','like') THEN
    RAISE EXCEPTION 'invalid kind';
  END IF;
  INSERT INTO public.profile_reactions (slug, kind, count)
  VALUES (_slug, _kind, 1)
  ON CONFLICT (slug, kind)
  DO UPDATE SET count = public.profile_reactions.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;