-- Members
CREATE POLICY "Finance can view members" ON public.members
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Finance can update members" ON public.members
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'finance'))
WITH CHECK (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Finance can delete members" ON public.members
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'finance'));

-- Donation collections
CREATE POLICY "Finance manage donation collections" ON public.donation_collections
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'finance'))
WITH CHECK (public.has_role(auth.uid(), 'finance'));

-- Finance entries
CREATE POLICY "Finance can insert finance entries" ON public.finance_entries
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Finance can update finance entries" ON public.finance_entries
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'finance'))
WITH CHECK (public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Finance can delete finance entries" ON public.finance_entries
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'finance'));