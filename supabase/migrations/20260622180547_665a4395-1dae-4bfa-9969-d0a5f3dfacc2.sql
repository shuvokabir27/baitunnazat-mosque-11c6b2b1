CREATE TABLE public.qa_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.qa_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_categories TO authenticated;
GRANT ALL ON public.qa_categories TO service_role;

ALTER TABLE public.qa_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published categories"
  ON public.qa_categories FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Authenticated can read all categories"
  ON public.qa_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.qa_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
  ON public.qa_categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
  ON public.qa_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_qa_categories_updated_at
  BEFORE UPDATE ON public.qa_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.qa_entries
  ADD COLUMN category_id uuid REFERENCES public.qa_categories(id) ON DELETE SET NULL;