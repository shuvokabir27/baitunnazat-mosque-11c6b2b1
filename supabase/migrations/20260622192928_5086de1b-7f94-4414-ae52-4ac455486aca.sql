-- Fix 1: Add input validation to masala_requests INSERT policy
DROP POLICY IF EXISTS "Anyone can submit a masala request" ON public.masala_requests;
CREATE POLICY "Anyone can submit a masala request"
ON public.masala_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(subject)) BETWEEN 1 AND 2000
  AND length(btrim(scholar_slug)) BETWEEN 1 AND 100
  AND length(btrim(scholar_name)) BETWEEN 1 AND 200
  AND length(btrim(scholar_role)) BETWEEN 1 AND 200
);

-- Fix 2: Restrict reading unpublished qa_categories to admins only
DROP POLICY IF EXISTS "Authenticated can read all categories" ON public.qa_categories;
CREATE POLICY "Admins can read all categories"
ON public.qa_categories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR published = true);