CREATE TABLE public.qa_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.qa_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_entries TO authenticated;
GRANT ALL ON public.qa_entries TO service_role;

ALTER TABLE public.qa_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published QA"
ON public.qa_entries FOR SELECT
USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert QA"
ON public.qa_entries FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update QA"
ON public.qa_entries FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete QA"
ON public.qa_entries FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_qa_entries_updated_at
BEFORE UPDATE ON public.qa_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();